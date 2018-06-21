const utils = {
    delay(timeout: number): Promise<any> {
        const promise = new Promise<any>((resolve) => {
          setTimeout(() => {
            resolve();            
          }, timeout);
        });
    
        return promise;
      }
}

export default utils;