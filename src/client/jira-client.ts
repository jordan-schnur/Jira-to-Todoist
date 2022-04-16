import ApiService from "../networking/api-service";
import { IssueBean, StatusDetails } from "../networking/JiraApi";

export default class JiraClient extends ApiService {
    public async searchJQL(query: string): Promise<IssueBean[]> {
        return this.get(`/rest/api/2/search?jql=${query}`).then(result => {
            let issues = result.data.issues;

            return issues;
        }).catch(error => {
            console.log("An error occured while searching: " + error);

            return null;
        });
    }

    public async getStatuses(): Promise<StatusDetails[]>  {
        return this.get(`/rest/api/2/status`).then(result => {
            let statuses = result.data;

            return statuses;
        }).catch(error => {
            console.log("An error occured while getting all statuses: " + error);

            return null;
        });
    }
}