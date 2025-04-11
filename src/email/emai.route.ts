import { Hono } from "hono";
import { send_email } from "./email.controller.js";

const email_route = new Hono().basePath('./email')

email_route.get('/:id', send_email)