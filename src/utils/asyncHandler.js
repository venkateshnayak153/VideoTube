const asyncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next)
    } catch (err) {
        const statusCode = (typeof err.statusCode === "number" && err.statusCode >= 100 && err.statusCode < 600)
            ? err.statusCode
            : (typeof err.code === "number" && err.code >= 100 && err.code < 600)
                ? err.code
                : 500

        res.status(statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        })
    }
}

export { asyncHandler }

