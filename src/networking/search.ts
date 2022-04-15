import ApiService from "./api-service";

export interface SearchResult {

}

export default class Search extends ApiService {
    public async search(query: string): Promise<any> {
        let result = await this.get(`/rest/api/2/search?jql=${query}`);
        result.data.issues.forEach(issue => {
            console.log(issue.key);
        }
    }
}