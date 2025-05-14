const { ValidationError } = require('./errors');
const Joi = require('joi');

const toolRequestSchema = Joi.object({
  serverName: Joi.string().required().pattern(/^[a-zA-Z0-9\-_]+$/),
  toolName: Joi.string().required().pattern(/^[a-zA-Z0-9\-_]+$/),
  args: Joi.object().required()
});

const resourceRequestSchema = Joi.object({
  serverName: Joi.string().required().pattern(/^[a-zA-Z0-9\-_]+$/),
  resourceUri: Joi.string().required().uri()
});

const validateToolRequest = (req, res, next) => {
  try {
    const { error } = toolRequestSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const details = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      throw new ValidationError('Invalid tool request', details);
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateResourceRequest = (req, res, next) => {
  try {
    const { error } = resourceRequestSchema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const details = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      throw new ValidationError('Invalid resource request', details);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateToolRequest,
  validateResourceRequest
};
