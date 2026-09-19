const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        const rawCode = error.statusCode ?? error.code;
        const statusCode = typeof rawCode === "number" && rawCode >= 100 && rawCode < 600 ? rawCode : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}

export {asyncHandler};
 