class Map{

    constructor(canvas,context){

        this.canvas=canvas;
        this.context=context;
        this.layer=0;
        this.lastPlatform=null;
        this.layers=[
            [
                {   x:0,
                    y:canvas.height,
                    w:canvas.width,
                    h:1,
                },
                {   x:130,
                    y:canvas.height-90,
                    w:30,
                    h:10,
                },
                {   x:300,
                    y:canvas.height-200,
                    w:50,
                    h:10,
                },
                {   x:500,
                    y:canvas.height-200,
                    w:30,
                    h:10,
                },
                {   x:0,
                    y:canvas.height-210,
                    w:30,
                    h:10,
                },
                {   x:50,
                    y:canvas.height-310,
                    w:30,
                    h:10,
                },
                {   x:590,
                    y:canvas.height-250,
                    w:30,
                    h:10,
                },
                {   x:300,
                    y:canvas.height-350,
                    w:10,
                    h:10,
                },
                {   x:400,
                    y:canvas.height-400,
                    w:20,
                    h:10,
                },
                {   x:500,
                    y:canvas.height-450,
                    w:30,
                    h:10,
                },
                {   x:600,
                    y:canvas.height-500,
                    w:10,
                    h:10,
                },
                {   x:50,
                    y:canvas.height-600,
                    w:40,
                    h:10,
                },
            ],



        ];
    }


    isXAligned(floor, pos){
        return floor.x>pos.x+pos.width || floor.x+floor.w<pos.x
    }

    isYAligned(block, pos){
        return block.y>pos.y+pos.height || block.y+block.h<pos.y
    }

    /*
    -2 == falling
    -1 == on platform 
    0  == no collision
    >0 == max distance until a landing
    */
    characterCollisionY(initPos, newPos){
        //character not falling assumed to be on a platform
        if(initPos.y==newPos.y){
            if(this.lastPlatform!=null && this.isXAligned(this.lastPlatform,newPos)) return -2
            return -1;
        }

        let retval = 0;
        this.layers[this.layer].forEach(e => {
            //not aligned on x
            if(this.isXAligned(e,newPos)) return;
            if(newPos.y+newPos.height>e.y){
                let amount = e.y-initPos.height-initPos.y;
                if(amount>0 && (retval==0||amount<retval)){
                    this.lastPlatform=e;
                    retval=amount;
                } 
            }
        });

        return retval;


    }

    /*
    <0 == max distance before collision to the left
    0  == no collision
    >0 == max distance before collision to the right
    */
    characterCollisionX(initPos, newPos){
        //character is not moving in the x direction
        if(initPos.x==newPos.x) return 0;

        // this.layers[this.layer].forEach(e => {
        //     //not aligned on x
        //     if(this.isYAligned(e,newPos)) return;
        //     if(newPos.x){
        //         let amount = e.y-initPos.height-initPos.y;
        //         if(retval==0||amount<retval){
        //             this.lastPlatform=e;
        //             retval=amount;
        //         } 
        //     }
        // });

        return 0;
    }

    moveMapLayer(amount){

    }

    characterMove(pos){

    }

    draw(){
        this.context.fillStyle = "#000000";
        this.layers[this.layer].forEach(e => this.context.fillRect(e.x,e.y,e.w,e.h))
    }



}