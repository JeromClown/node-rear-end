function createLogicHandler(someParameter) {
    return function handleSomeLogic(req, res, next) {
        console.log('Using parameter:', someParameter); 
        console.log(req.query) 
          
        //逻辑处理...  
        next();  
    };  
}  

function ogicHandler(someParameter) { 
    return function handleSomeLogic(req, res, next) {
        console.log('111111:', someParameter);
        next();  
    };  
}  
  
module.exports = {  
    createLogicHandler,
    ogicHandler
};