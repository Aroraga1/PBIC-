import { Router } from "express";
import SelectedMode from '../controller/user.controller.js';
Router.router();

Router.route('/:type/:RegistrationNumber').get({SelectedMode});
// Router.route('/:type/:RegistrationNumber').get({SelectedMode});