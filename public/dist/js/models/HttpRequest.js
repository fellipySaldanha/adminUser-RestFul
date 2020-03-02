class HttpRequest{

    static get(url, params ={}){
        return HttpRequest.request('GET', url, params);
    }

    static post(url, params ={}){
        return HttpRequest.request('POST', url, params);
    }

    static put(url, params ={}){
        return HttpRequest.request('PUT', url, params);
    }

    static delete(url, params ={}){
        return HttpRequest.request('DELETE', url, params);
    }
    
    static request(method, url, params = {}){

        return new Promise((resolve, reject) => {
            
            let ajax = new XMLHttpRequest();
            
            ajax.open(method.toUpperCase(), url, true);
            
            ajax.onerror = event =>{
                reject(error);
            }
            
            ajax.onload = event => {
                let obj = {};

                try {
                    console.log(ajax.responseText)
                    obj = JSON.parse(ajax.responseText);
                } catch (error) {
                    reject(error);
                    console.log(error);
                }

                resolve(obj);
            };
            
            ajax.setRequestHeader('Content-Type', 'application/json');

            ajax.send(JSON.stringify(params));
        });        
    }
}