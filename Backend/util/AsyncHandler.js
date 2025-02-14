const AsyncHandler = (reqHandler) => {
    return (req,res,next) => {
        Promise.resolve(reqHandler(req,res,next)).catch((e)=>next(e));
    } 
}
module.exports = {AsyncHandler};