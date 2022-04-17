import 'dotenv/config';
import "axios";
import cron from 'node-cron';
import SearchService, { ACTIVE_TASK } from './networking/search-service';
import { LocalStorage } from 'node-localstorage';
import { Label, TodoistApi } from '@doist/todoist-api-typescript';
import "./env_asserts/env-asserts";
import { ENV_SERVER, ENV_TODOIST_TOKEN } from './env_asserts/env-asserts';
import { IssueBean, StatusDetails } from './networking/JiraApi';
import JiraClient from './client/jira-client';
import { TODOIST_COLOR } from './todoist-colors';
import { getLogger } from './logging/LogConfig';
import { TSMap } from 'typescript-map';
import { createServer } from 'http';

export const localStorage = new LocalStorage('./storage');
export const ACTIVE_ISSUES_KEY = 'activeIssues';
export const TODOIST_INBOX_KEY = 'todoistInbox';
export const LABELS_KEY = 'labels';
export const USER_KEY = 'user';
export let TODOIST_INBOX_ID = -1;
export const todoistApi = new TodoistApi(ENV_TODOIST_TOKEN);
export let DEFUALT_TODOIST_LABEL_ID = 2158644766;
export const logger = getLogger("main");
export const JIRA_STATUS_CONFIG = {
    "To Do": {
        colorId: TODOIST_COLOR.red.id,
        namePattern: "[*issue*] Complete *summary*"
    },
    "In Progress": {
        colorId: TODOIST_COLOR.yellow.id,
        namePattern: "[*issue*] Complete *summary*"
    },
    "Peer Review": {
        colorId: TODOIST_COLOR.lime_green.id,
        namePattern: "[*issue*] Review *summary*"
    },
    "Blocked": {
        colorId: TODOIST_COLOR.red.id,
        namePattern: "[*issue*] Unblock *summary*"
    },
    "Awaiting Acceptance": {
        colorId: TODOIST_COLOR.blue.id,
        namePattern: "[*issue*] Demo *summary*"
    },

}

localStorage.setItem(USER_KEY, true);

if (localStorage.getItem(TODOIST_INBOX_KEY) === null || localStorage.getItem(TODOIST_INBOX_KEY) === '') {
    todoistApi.getProjects().then(projects => {
        for (let project of projects) {
            if (project.name === 'Inbox') {
                localStorage.setItem(TODOIST_INBOX_KEY, project.id);
                TODOIST_INBOX_ID = project.id;
            }
            break;
        }
    });
} else {
    TODOIST_INBOX_ID = parseInt(localStorage.getItem(TODOIST_INBOX_KEY));
}

export interface LabelObject {
    todoistId: number;
    jiraId: number;
};
 

let labels: TSMap<String, LabelObject> = (localStorage.getItem(LABELS_KEY) === null || localStorage.getItem(LABELS_KEY) === '') 
? new TSMap() 
: new TSMap<String, LabelObject>().fromJSON(JSON.parse(localStorage.getItem(LABELS_KEY)));
 
function getJiraStatusConfigFromName(statusName: string): {colorId: number, namePattern: string} { 
    for(let configStatusName of Object.keys(JIRA_STATUS_CONFIG)) {
        if(statusName.includes(configStatusName)) {
            return JIRA_STATUS_CONFIG[configStatusName];
        }
    }

    return {
        colorId: TODOIST_COLOR.charcoal.id,
        namePattern: "[*issue*] *summary*"
    }
}

function jiraIssueToTodoistTaskNameWithPattern(issue: IssueBean, pattern: string): string {
    return pattern
    .replace("*issue*", issue.key!)
    .replace("*summary*", issue.fields!.summary);
}

function todoistColorFromCategoryId(categoryId: number): number {
    switch(categoryId) {
        case 1:
            return TODOIST_COLOR.charcoal.id;
            break;
        case 2:
            return TODOIST_COLOR.blue.id;
            break;
        case 3:
            return TODOIST_COLOR.mint_green.id;
            break;
        case 4:
            return TODOIST_COLOR.yellow.id;
            break;
    }

    return TODOIST_COLOR.charcoal.id;
}

async function createLabelIfNotExist(name: string, jiraLabelId: number, colorId: number): Promise<LabelObject|undefined> {
    if(!labels.has(name)) {
        try {
            let label = await todoistApi.addLabel({
                name: name,
                color: colorId,
            })

            let labelObject: LabelObject = {   
                todoistId: label.id,
                jiraId: jiraLabelId
            }; 

            logger.info("Created new todoist label", {
                "label_name": name,
                "jira_label_id": jiraLabelId,
            }); 


            labels.set(name, labelObject); 
            localStorage.setItem(LABELS_KEY, JSON.stringify(labels.toJSON()));

            return labelObject
        } catch (e) { 
            //console.log("Failed to create todoist label: %s. Error %o", name, e);
            logger.error("Failed to create todoist label", e, {
                "label_name": name,
                "jira_label_id": jiraLabelId,
            });
            return;
        }
    }

    return labels.get(name);
}

function formatDescription(description: string|null) {
    if(description) {
        return "**Task Description**\n"
    }

    return '';
}

async function createTodoistTaskFromIssue(issue: IssueBean): Promise<void> {
    let taskConfig = getJiraStatusConfigFromName(issue.fields!.status.name);
    let label = await createLabelIfNotExist("jira-" + issue.fields!.status.name.replace(/\s/g, '-'),  issue.fields!.status.id, taskConfig!.colorId);
    let labelIds: Array<number> = (DEFUALT_TODOIST_LABEL_ID !== -1) ? [DEFUALT_TODOIST_LABEL_ID] : [];

    if(label) {
        labelIds.push(label.todoistId);
    }

    todoistApi.addTask({
        content: jiraIssueToTodoistTaskNameWithPattern(issue, taskConfig!.namePattern),
        description: ENV_SERVER + "/browse/" + issue.key + "\n\n" + formatDescription(issue.fields!.description),
        labelIds: labelIds,
    }).then(task => {
        //console.log("Task added: " + task.id);
        logger.info("Added task to Todoist" , {todoist_task_id: task.id, jira_issue_key: issue.key, "jira_issue_status": issue.fields!.status.name});
    }).catch(error => {
        logger.error("Failed to add task to Todoist", error, {jira_issue_key: issue.key, "jira_issue_status": issue.fields!.status.name});
        //console.log("An error occured while adding task: " + error);
    });
}

let search = new SearchService();

function searchIssuesPlease() {
    search.searchIssues(ACTIVE_TASK).then(async issues => {
        let savedIssues: IssueBean[];
        // check if active issues are already stored or an empty string is stored
        // if true set savedIssues to the value
        // if false set savedIssues to an empty array  
        if (localStorage.getItem(ACTIVE_ISSUES_KEY) === null || localStorage.getItem(ACTIVE_ISSUES_KEY) === '') {
            savedIssues = [];
        } else {
            savedIssues = JSON.parse(localStorage.getItem(ACTIVE_ISSUES_KEY));
        }
    
        let issueMap = new Map();
    
        for (let issue of savedIssues) {
            issueMap.set(issue.key, issue);
        }
    
        // Loop through issues and check if it is saved in issueMap 
        // if it is check if the status has changed and if so add it to the todoist inbox and replace the issue in issueMap
        // if it is not saved in issueMap add it to the todoist inbox and add it to the issueMap
        for (let issue of issues) {
            if (issueMap.has(issue.key)) { 
                let savedIssue = issueMap.get(issue.key);
                if (savedIssue.fields.status.name !== issue.fields!.status.name) { // Task found but status has changed
                    createTodoistTaskFromIssue(issue);
                    issueMap.set(issue.key, issue);
                }
            } else { // No task found in issueMap
                createTodoistTaskFromIssue(issue);
                issueMap.set(issue.key, issue);
            }
        }
        
        let bobIssues: IssueBean[] = [];
        for (let issue of issueMap.values()) {
            bobIssues.push(issue);
        }
        localStorage.setItem(ACTIVE_ISSUES_KEY, JSON.stringify(bobIssues));
    }).catch(error => {
        logger.error("Failed to search issues", error, {"search_query": ACTIVE_TASK});
    });
}

cron.schedule('*/5 * * * *', () => {
    searchIssuesPlease();
});

searchIssuesPlease();

createServer((req, res) => { // Keep process alive, should work just with the cron but better safe than sorry
    logger.info("Request received from client", {"request_id": req.url});
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World');
    res.end();
}).listen(process.env.PORT || 3000);