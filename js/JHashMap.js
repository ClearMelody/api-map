/**
ref http://code.google.com/p/gridtree-jquery-plugin-demo/source/browse/trunk/js%E5%8C%85/hashMap.js?r=2
*/
function HashMap()   
 {   
     var size = 0;
     var entry = new Object(); 
     this.put = function (key , value)   
     {   
         if(!this.containsKey(key))   
         {   
             size ++ ;   
         }   
         entry[key] = value;   
     }  
     this.get = function (key)   
     {   
         return this.containsKey(key) ? entry[key] : null;   
     }  
     this.remove = function ( key )   
     {   
         if( this.containsKey(key) && ( delete entry[key] ) )   
         {   
             size --;   
         }   
     }  
     this.containsKey = function ( key )   
     {   
         return (key in entry);   
     }   
     this.containsValue = function ( value )   
     {   
         for(var prop in entry)   
         {   
             if(entry[prop] == value)   
             {   
                 return true;   
             }   
         }   
         return false;   
     }        
     this.values = function ()   
     {   
         var values = new Array();   
         for(var prop in entry)   
         {   
             values.push(entry[prop]);   
         }   
         return values;   
     }           
    
     this.keys = function ()   
     {   
         var keys = new Array();   
         for(var prop in entry)   
         {   
             keys.push(prop);   
         }   
         return keys;   
     }   
     /** Map Size **/  
     this.size = function ()   
     {   
         return size;   
     } 
     this.clear = function ()   
     {   
         size = 0;   
         entry = new Object();   
     }   
 }   