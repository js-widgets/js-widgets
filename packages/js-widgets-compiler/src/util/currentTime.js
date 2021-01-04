// Leverage the require cache to ensure a single timestamp for the whole execution.
const currentTime = new Date().toJSON();

// Make it a function to simplify mocking during testing.
module.exports = () => currentTime;
