import joi from "joi";

const deviceSchema = joi.object({
    id: joi.string().required(),
    set_point: joi.string().required(),
    location_id: joi.number().required(),
    usage: joi.number().required(),
});

export default deviceSchema;
