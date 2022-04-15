import 'dotenv/config';
import "axios";
import axios from 'axios';
import cron from 'node-cron';
import SearchService from './networking/search-service';
import {LocalStorage} from 'node-localstorage';

export const localStorage = new LocalStorage('./storage');

let base64Auth = Buffer.from(process.env.username+":"+process.env.password).toString("base64");

let search = new SearchService();
search.search('assignee in (currentUser()) AND issuetype in subTaskIssueTypes() AND status in (Blocked, "In Progress", "Peer Review", Ready) order by created DESC').then(result => {
    console.log("This returned");
});

if(localStorage.getItem("lastRun") === null) {
    localStorage.setItem("lastRun", "0");
    console.log("Setting lastRun to 0");
}

console.log("After")

// cron.schedule('1 * * * * *', () => {
//     console.log('running a task every seconds');
// });
console.log(base64Auth);