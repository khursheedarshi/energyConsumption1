import database from "../services/database.js";
import {
    ScanCommand,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import deviceSchema from "../models/device.js";

async function getAllDevices(req, res, next) {
    try {
        const params = {
            TableName: "Devices",
        };
        const command = new ScanCommand(params);
        const result = await database.send(command);
        res.status(200).json(result.Items);
    } catch (err) {
        next(err);
    }
}

async function createDevice(req, res, next) {
    try {
        const uuid = uuidv4();
        req.body.id = uuid;
        const { error, value } = deviceSchema.validate(req.body);

        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { id, location_id, set_point, usage } = value;

        const params = {
            TableName: "Devices",
            Item: {
                id,
                location_id,
                set_point,
                usage,
            },
        };

        const command = new PutCommand(params);

        await database.send(command);

        res
            .status(201)
            .json({ message: "Successfully created device", data: params.Item });
    } catch (error) {
        next(error);
    }
}

async function getDeviceById(req, res, next) {
    const deviceId = req.params.id;
    try {
        const params = {
            TableName: "Devices",
            Key: { id: deviceId },
        };
        const command = new GetCommand(params);
        const result = await database.send(command);
        if (!result.Item) {
            return res.status(404).json({ message: "No device found" });
        }
        res.status(200).json(result.Item);
    } catch (err) {
        next(err);
    }
}

async function updateDeviceById(req, res, next) {
    try {
        const deviceId = req.params.id;
        req.body.id = deviceId;
        const { error, value } = deviceSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { usage, set_point, location_id, device_number } = value;

        // Get the devices from DynamoDB
        const getParams = {
            TableName: "Devices",
            Key: { id: deviceId },
        };

        const getCommand = new GetCommand(getParams);

        const result = await database.send(getCommand);

        const device = result.Item;

        if (!device) {
            return res.status(404).json({ message: "No device found" });
        }

        // Update the device in DynamoDB
        const updateParams = {
            TableName: "Devices",
            Key: { id: deviceId },
            UpdateExpression:
                "set #usage = :usage, #set_point = :set_point, #location_id = :location_id",
            ExpressionAttributeNames: {
                "#usage": "usage",
                "#set_point": "set_point",
                "#location_id": "location_id",
            },
            ExpressionAttributeValues: {
                ":usage": usage,
                ":set_point": set_point,
                ":location_id": location_id,
            },
            ReturnValues: "ALL_NEW",
        };
        const updateCommand = new UpdateCommand(updateParams);
        const updatedDevice = await database.send(updateCommand);

        res.status(200).json(updatedDevice.Attributes);
    } catch (err) {
        next(err);
    }
}

async function deleteDeviceById(req, res, next) {
    const deviceId = req.params.id;
    try {
        const params = {
            TableName: "Devices",
            Key: { id: deviceId },
        };
        const command = new DeleteCommand(params);
        await database.send(command);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}
export default {
    getAllDevices,
    createDevice,
    getDeviceById,
    updateDeviceById,
    deleteDeviceById
};
