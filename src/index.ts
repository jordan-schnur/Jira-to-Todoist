import 'dotenv/config';
import "axios";
import cron from 'node-cron';
import SearchService, { ACTIVE_TASK } from './networking/search-service';
import {LocalStorage} from 'node-localstorage';
import { Issue } from './networking/search-results';
import { TodoistApi } from '@doist/todoist-api-typescript';
import "./env_asserts/env-asserts";
import { ENV_SERVER, ENV_TODOIST_TOKEN } from './env_asserts/env-asserts';

export const localStorage = new LocalStorage('./storage');
export const ACTIVE_ISSUES_KEY = 'activeIssues';
export const TODOIST_INBOX_KEY = 'todoistInbox';
export let TODOIST_INBOX_ID = -1;
export const todoistApi = new TodoistApi(ENV_TODOIST_TOKEN);

if (localStorage.getItem(TODOIST_INBOX_KEY) === null) {
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

let search = new SearchService();
search.searchIssues(ACTIVE_TASK).then(issues => {
    let savedIssues: Issue[] = JSON.parse(localStorage.getItem(ACTIVE_ISSUES_KEY));
    
    // TODO: Make more efficient, hashmaps are always cool
    if (savedIssues) {
        for (let issue of issues) {
            let found = false;
            for (let savedIssue of savedIssues) {
                if (savedIssue.key === issue.key) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                savedIssues.push(issue);

                todoistApi.addTask({
                    content: "[" + issue.key + "] " + issue.fields.summary,
                    description: ENV_SERVER + "/browse/" + issue.key + "\n\n" + issue.fields.description,
                }).then(task => {
                    console.log("Task added" + task.id);
                }).catch(error => {
                    console.log("An error occured while adding task: " + error);
                });

            }
        }
    } else {
        savedIssues = issues;
    }

    localStorage.setItem(ACTIVE_ISSUES_KEY, JSON.stringify(savedIssues));
});

// cron.schedule('1 * * * * *', () => {
//     console.log('running a task every seconds');
// });