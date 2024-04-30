import knex from "knex"
import config from "../knexfile.js";
const environment = process.env.NODE_ENV || 'development'

export default knex(config[environment]);