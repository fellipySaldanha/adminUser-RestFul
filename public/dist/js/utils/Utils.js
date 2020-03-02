class Utils{
    static dateFormart(date){
        return date.getDate() + '/'  +  (date.getMonth()+1)  + '/' + date.getFullYear()  + ' ' +date.getHours() + ':' + date.getMinutes();
    }
}