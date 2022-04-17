import ApiService from "./api-service";
import { IssueBean } from "./JiraApi";

//export const ACTIVE_TASK = 'assignee in (currentUser()) AND issuetype in subTaskIssueTypes() AND status in (Blocked, "In Progress", "Peer Review", Ready) order by created DESC';
export const ACTIVE_TASK = 'issuetype in (subTaskIssueTypes(), Story) AND status in ("Awaiting Acceptance", Blocked, "In Progress", "Peer Review") AND assignee in (currentUser()) order by created DESC';


export default class SearchService extends ApiService {
    public async searchIssues(query: string): Promise<IssueBean[]> {
        return this.get(`/rest/api/2/search?jql=${query}`).then(result => {
            let issues = result.data.issues;

            return issues;
        }).catch(error => {
            console.log("An error occured while searching: " + error);

            return null;
        });
    }
}