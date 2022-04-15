import ApiService from "./api-service";
import { SearchResults, Issue } from "./search-results";

export default class SearchService extends ApiService {
    public async search(query: string): Promise<void> {
        this.get(`/rest/api/2/search?jql=${query}`).then(result => {
            let issues = result.data.issues;

            issues.forEach((issue: Issue) => {
                console.log(issue.key);
            });
        }).catch(error => {
            console.log("An error occured while searching: " + error);
        });

        // result.issues.forEach(issue => {
        //     console.log(issue.key);
        // });
    }
}