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

export const localStorage = new LocalStorage('./storage');
export const ACTIVE_ISSUES_KEY = 'activeIssues';
export const TODOIST_INBOX_KEY = 'todoistInbox';
export const LABELS_KEY = 'labels';
export const USER_KEY = 'user';
export let TODOIST_INBOX_ID = -1;
export const todoistApi = new TodoistApi(ENV_TODOIST_TOKEN);

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

let labelMap: Map<string, number> = new Map();
let labels: Map<String, LabelObject> = new Map();
let jiraLabelToTodoistLabel: Map<number, number> = new Map();

function setStatuses() {
    
}

if (localStorage.getItem(LABELS_KEY) === null || localStorage.getItem(LABELS_KEY) === '') {
    let todoistLabels: Map<string, number> = new Map();
    // get labels from todoist
    todoistApi.getLabels().then(labels => {
        let labelIds = [];
        for (let label of labels) {
            todoistLabels.set(label.name, label.id);
        }

        return new JiraClient().getStatuses();
    }).then((statuses) => {
        let status: StatusDetails;
        for (status of statuses) {
            if(labelMap.get("Jira - " + status.name) === undefined) {
                switch (status.id) {
                    case 1:
                        todoistApi.addLabel({
                            name: "Jira - " + status.name,
                            color: 48,
                        }).then((label) => {
                            labels.set("Jira - " + status.name, {   
                                todoistId: label.id,
                                jiraId: status.id
                            });
                        }).catch(err => {
                            console.log("Error adding jira label" + err);
                            console.log(err); 
                            setStatuses();
                        });
                        break;
                    case 2: // To Do
                        case 1:
                        todoistApi.addLabel({
                            name: "Jira - " + status.name,
                            color: 47,
                        }).then((label) => {
                            labels.set("Jira - " + status.name, {   
                                todoistId: label.id,
                                jiraId: status.id
                            });
                        }).catch(err => {
                            console.log("Error adding jira label" + err);
                            console.log(err); 
                            setStatuses();
                        });
                        break;
                    case 3: // Done
                        case 1:
                        todoistApi.addLabel({
                            name: "Jira - " + status.name,
                            color: 48,
                        }).then((label) => {
                            labels.set("Jira - " + status.name, {   
                                todoistId: label.id,
                                jiraId: status.id
                            });
                        }).catch(err => {
                            console.log("Error adding jira label" + err);
                            console.log(err); 
                            setStatuses();
                        });
                        break;
                    case 4: // In Progress
                        todoistApi.addLabel({
                            name: "Jira - " + status.name,
                            color: 33,
                        }).then((label) => {
                            labels.set("Jira - " + status.name, {   
                                todoistId: label.id,
                                jiraId: status.id
                            });
                        }).catch(err => {
                            console.log("Error adding jira label" + err);
                            console.log(err); 
                            setStatuses();
                        });
                        break;
                }
            }
        }
    });
};




let search = new SearchService();
search.searchIssues(ACTIVE_TASK).then(issues => {
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
            console.log(savedIssue.key + " Found");
            console.log(savedIssue.fields.status.name + " !=== " + issue.fields!.status.name);
            if (savedIssue.fields.status.name !== issue.fields!.status.name) {
                todoistApi.addTask({
                    content: "[" + issue.key + "] " + issue.fields!.summary,
                    description: ENV_SERVER + "/browse/" + issue.key + "\n\n" + issue.fields!.description,
                }).then(task => {
                    console.log("Task added" + task.id);
                }).catch(error => {
                    console.log("An error occured while adding task: " + error);
                });
                //todoistApi.addItemToProject(TODOIST_INBOX_ID, issue.key, issue.fields.status.name);
                issueMap.set(issue.key, issue);
            }
        } else {
            todoistApi.addTask({
                content: "[" + issue.key + "] " + issue.fields!.summary,
                description: ENV_SERVER + "/browse/" + issue.key + "\n\n" + issue.fields!.description,
            }).then(task => {
                console.log("Task added: " + task.id);
            }).catch(error => {
                console.log("An error occured while adding task: " + error);
            });
            issueMap.set(issue.key, issue);
        }
    }
    
    let bobIssues: IssueBean[] = [];
    for (let issue of issueMap.values()) {
        bobIssues.push(issue);
    }

    localStorage.setItem(ACTIVE_ISSUES_KEY, JSON.stringify(bobIssues));
});


    // TODO: Make more efficient, hashmaps are always cool
    // if (savedIssues) {
    //     for (let issue of issues) {
    //         let found = false;
    //         for (let savedIssue of savedIssues) {
    //             if (savedIssue.key === issue.key) {
    //                 if (savedIssue.fields.status !== issue.fields.status) {
    //                     found = false
    //                 }
    //                 found = true;
    //                 break;
    //             }
    //         }
    //         if (!found) {
    //             savedIssues.push(issue);

    //             console.log("ToDoist: " + issue.key + " is now active");
    //             // todoistApi.addTask({
    //             //     content: "[" + issue.key + "] " + issue.fields.summary,
    //             //     description: ENV_SERVER + "/browse/" + issue.key + "\n\n" + issue.fields.description,
    //             // }).then(task => {
    //             //     console.log("Task added" + task.id);
    //             // }).catch(error => {
    //             //     console.log("An error occured while adding task: " + error);
    //             // });

    //         }
    //     }
    // } else {
    //     savedIssues = issues;
    // }

    // localStorage.setItem(ACTIVE_ISSUES_KEY, JSON.stringify(savedIssues));
//});

// cron.schedule('1 * * * * *', () => {
//     console.log('running a task every seconds');
// });