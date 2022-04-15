import 'dotenv/config';
import "axios";
import axios from 'axios';

let base64Auth = Buffer.from(process.env.username+":"+process.env.password).toString("base64");

axios.get("http://www.randomnumberapi.com/api/v1.0/random?min=100&max=1000&count=5").then(res => {
    console.log(res.data);
});
console.log(base64Auth);