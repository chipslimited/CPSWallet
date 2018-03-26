const dbUtils = {
    get: function(key){
        return localStorage.getItem(key);
    },
    set: function(key, value){
        localStorage.setItem(key, value);
        return value;
    }
}
export default dbUtils;