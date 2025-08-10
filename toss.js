let rand= Math.random();
document.getElementById('tossBtn').onclick=function(){
    if(rand>=0.5){
        alert("HEADS");
    }
    else alert('TAILS');
}