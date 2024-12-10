import express from "express";
import devicesController from "../controllers/devicesController.js";

const Router = express.Router();

Router.route("/devices")
    .get(devicesController.getAllDevices)
    .post(devicesController.createDevice);

Router.route("/devices/:id") // <-- this defines an endpoint with a "placeholder" for the id
    .get(devicesController.getDeviceById)
    .put(devicesController.updateDeviceById)
    .delete(devicesController.deleteDeviceById);
export default Router;
