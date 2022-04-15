import assert from "assert";
import 'dotenv/config';

assert(process.env.server);
assert(process.env.username);
assert(process.env.password);
assert(process.env.todoist_token);

export const ENV_SERVER = process.env.server;
export const ENV_USERNAME = process.env.username;
export const ENV_PASSWORD = process.env.password;
export const ENV_TODOIST_TOKEN = process.env.todoist_token;