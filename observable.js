class Observable {
  observers = [];

  on(eventName, callback) {
    this.observers.push({
      eventName,
      callback,
    });
  }

  remove(callback) {
    const index = this.observers.findIndex(observer => observer === callback);
    if (index !== -1) {
      this.observers.splice(index);
    }
  }

  trigger(eventName, data) {
    this.observers
      .filter(observer => observer.eventName === eventName)  
      .forEach(observer => {
        observer.callback(data);
      });
  }
}

class Server extends Observable {
  publish(data) {
    this.trigger('message', data);
  }
}

const server = new Server();
server.on('message', console.log);
setTimeout(() => server.publish({ name: 'Qanh' }), 10000)
