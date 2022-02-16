class Character{

    constructor(canvas,context,stage,xPos,yPos,radius,name){

        this.map=stage;
        this.gameState={
            xPos:xPos,
            yPos:yPos,
            xVel:0,
            yVel:0,
            isInAir:false,
            jumpingTime:0,
            isAttacking:false,
            attackingTime:0,
            runAnimationFrame:0,
            radius:radius,
            name:name,
            facingRight:true,
        };

        //Save time not having to redo floating points
        this.consts={
            r:radius,
            r2:radius/2,
            r4:radius/4,
            r8:radius/8,
            r16:radius/16,
            baseColor:"#A04FBE",
            maxAttackCount:1.5,
            maxRunAnimationCount:1.5,
            maxRunSpeed:200,
            gravity:420,
            horizonalSlow:150,
            PI2: Math.PI*2,
            shoeRatio1:radius*50/75,
            shoeRatio2:radius*5/75,
            shoeRatio3:radius*40/75,
            radian:0.0174533,
            d30:0.436332,
            PI3o2:3/2*Math.PI,
        };
        this.context=context;
        this.canvas=canvas;
        this.wrapWidthRight=canvas.width+radius;
        this.wrapWidthLeft=-radius;
    }

    getGameState(){
        return this.gameState;
    }

    jump(yVel){
        if(this.gameState.isInAir) return;
        this.gameState.isInAir=true;
        this.gameState.yVel=-yVel;
        this.gameState.jumpingTime=0;
    }

    attack(){
        if(this.gameState.isAttacking) return;
        this.gameState.isAttacking=true;
        this.gameState.attackingTime=0;
    }

    moveVelocity(xVel){
        if(this.gameState.xVel+xVel>this.consts.maxRunSpeed)
            this.gameState.xVel=this.consts.maxRunSpeed;
        else if(this.gameState.xVel+xVel<-this.consts.maxRunSpeed)
            this.gameState.xVel=-this.consts.maxRunSpeed;
        else
            this.gameState.xVel+=xVel;
        this.gameState.facingRight=this.gameState.xVel>0;
    }

    panic(){
        // this.gameState.xVel=0;
        // this.gameState.yVel=0;
        // this.gameState.yPos=this.map;
        // this.gameState.isInAir=false;
    }

    getPosition(){
        let radiusx2=this.gameState.radius*2;
        let data = {
            x:this.gameState.xPos-this.gameState.radius,
            y:this.gameState.yPos-this.gameState.radius-this.consts.r4,
            width:radiusx2,
            height:radiusx2+this.consts.r4,
        };
        return data;
    }

    /**
     * TODO in A4 delta should be a set time, things will need to be
     * adjusted later to account for that. Everything now is rough visuals. 
     * @param {*} delta 
     */
    update(delta){

        //Movement updates
        let initPos = this.getPosition();
        let nextPos = this.getPosition();

        //Horizontal Movement
        let xDelta = delta*this.gameState.xVel;
        nextPos.x += xDelta; 
        let collisionInfo = this.map.characterCollisionX(initPos,nextPos);
        if(collisionInfo==0)
            this.gameState.xPos+=xDelta;
        else{
            this.gameState.xPos+=collisionInfo;
            this.gameState.xVel=0;
        }
        nextPos.x = initPos.x;
        
        let yDelta = delta*this.gameState.yVel; 
        nextPos.y += yDelta;
        collisionInfo = this.map.characterCollisionY(initPos,nextPos);

        //Virtical Movement
        if(collisionInfo==0){
            this.gameState.yVel+=delta*this.consts.gravity;
            this.gameState.isInAir=true;
            this.gameState.yPos+=yDelta;
        }else if(collisionInfo>0){
            this.gameState.yVel=0;
            this.gameState.yPos+=collisionInfo;
            this.gameState.yPos=Math.round(this.gameState.yPos);
            this.gameState.isInAir=false;
        }else if(collisionInfo==-2){
            this.gameState.isInAir=true;
            this.gameState.yVel+=delta*this.consts.gravity;
        }

        //slow down
        let change = delta*this.consts.horizonalSlow;
        if(this.gameState.xVel<0&&!this.gameState.isInAir){
            if(change>-this.gameState.xVel){
                this.gameState.xVel=0;
                this.gameState.runAnimationFrame=0;
            }else
                this.gameState.xVel+=change;
        }else if(this.gameState.xVel>0&&!this.gameState.isInAir){
            if(change>this.gameState.xVel){
                this.gameState.xVel=0;
                this.gameState.runAnimationFrame=0;
            }else
                this.gameState.xVel-=change;
        }

        //Walk animation
        if(this.gameState.xVel!=0&&!this.gameState.isInAir){
            this.gameState.runAnimationFrame+=delta;
            if(this.gameState.runAnimationFrame>this.consts.maxRunAnimationCount){
                this.gameState.runAnimationFrame=0;
            }
        }

        //Attack Animation
        if(this.gameState.isAttacking){
            this.gameState.attackingTime+=delta;
            if(this.gameState.attackingTime>=this.consts.maxAttackCount){
                this.gameState.isAttacking=false;
                this.gameState.attackingTime=0;
            }
        }

        //Screen Wrap
        if(this.gameState.xPos<=this.wrapWidthLeft){
            this.gameState.xPos=this.wrapWidthRight;
        }else if(this.gameState.xPos>=this.wrapWidthRight){
            this.gameState.xPos=this.wrapWidthLeft;
        }
    }

    drawBody(){

        //Overlay of limbs
        this.context.fillStyle = this.consts.baseColor;
        if(this.gameState.facingRight)
            this.drawLeftLimbs();
        else
            this.drawRightLimbs();


        //Solid Body
        this.context.beginPath();
        this.context.arc(0,-this.consts.r4,this.gameState.radius,0,this.consts.PI2);
        this.context.fill();
        this.context.stroke();

        //Other set of limbs
        if(this.gameState.facingRight)
            this.drawRightLimbs();
        else
            this.drawLeftLimbs();

        this.drawFace();

        
        if(this.gameState.name!=null){
            this.context.fillStyle = "#000000";
            this.context.font = '20px serif';
            this.context.fillText(this.gameState.name,-this.gameState.radius,-this.gameState.radius-this.consts.r4);
        }

        if(this.gameState.isAttacking)
            this.drawAttack();
    }

    drawRightLimbs(){
        this.drawFoot(this.consts.r4,this.gameState.radius,true);
        this.drawHand(true);
    }

    drawLeftLimbs(){
        this.drawFoot(this.consts.r4,this.gameState.radius,false);
        this.drawHand(false);
    }

    drawFoot(xPos,yPos,isRight){
        this.context.save();
        this.context.beginPath();
        this.context.fillStyle = "#00FF00";

        let angle=0;
        if(this.gameState.runAnimationFrame<=0.25){
            angle=this.consts.radian*this.gameState.runAnimationFrame;
        }else if(this.gameState.runAnimationFrame<=0.75){
            angle=this.consts.d30-this.consts.radian*(this.gameState.runAnimationFrame-0.25);
        }else{
            angle=-this.consts.d30+this.consts.radian*(this.gameState.runAnimationFrame-0.75);
        }
        this.context.rotate(isRight?angle:-angle);

        let radius = this.gameState.radius;
        if(this.gameState.facingRight){
            this.context.ellipse(xPos, yPos, radius, this.consts.shoeRatio1, 0, this.consts.PI3o2, 0);
            this.context.ellipse(xPos, yPos, radius, this.consts.shoeRatio2, 0, 0, Math.PI);
            this.context.ellipse(xPos, yPos, radius, this.consts.shoeRatio3, 0, Math.PI, 5/4*Math.PI);
        }else{
            this.context.ellipse(-xPos, yPos, radius, this.consts.shoeRatio2, 0, 0, Math.PI);
            this.context.ellipse(-xPos, yPos, radius, this.consts.shoeRatio1, 0, Math.PI, this.consts.PI3o2);
            this.context.ellipse(-xPos, yPos, radius, this.consts.shoeRatio3, 0, 7/4*Math.PI, 0);
        }
        this.context.fill();
        this.context.stroke();

        this.context.restore();
    }

    drawHand(isRight){
        this.context.save();
        if(!this.gameState.isAttacking && (this.gameState.xVel!=0 || this.gameState.isInAir))
            this.context.rotate(isRight?this.consts.d30:-this.consts.d30);
        
        let xOffset=!isRight?this.gameState.radius:-this.gameState.radius-this.consts.r16
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(xOffset,0,this.consts.r4,0,this.consts.PI2);
        this.context.fill();
        this.context.stroke();
        this.context.restore();
    }

    drawFace(){
        this.context.fillStyle = "#FFFFFF";
        let xOffset=this.gameState.facingRight?this.consts.r8:-this.consts.r8;
        let yPos = -this.consts.r4*7/4;

        this.context.beginPath();
        this.context.ellipse(-this.consts.r4+xOffset,yPos,this.consts.r4,this.consts.r8*3,0,0,this.consts.PI2);
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        this.context.ellipse(this.consts.r4+xOffset,yPos,this.consts.r4,this.consts.r8*3,0,0,2*Math.PI);
        this.context.fill();
        this.context.stroke();

        this.context.fillStyle = "#000000";
        xOffset+=this.gameState.facingRight?this.consts.r16:-this.consts.r16;
        this.context.beginPath();
        this.context.ellipse(-this.consts.r4+xOffset,yPos,this.consts.r8,this.consts.r4,0,0,this.consts.PI2);
        this.context.fill();

        this.context.beginPath();
        this.context.ellipse(this.consts.r4+xOffset,yPos,this.consts.r8,this.consts.r4,0,0,this.consts.PI2);
        this.context.fill();

        this.context.beginPath();
        if(this.gameState.isAttacking){
            this.context.fillStyle = "#FF0000";
            this.context.ellipse(xOffset,this.consts.r8,this.consts.r4,this.consts.r8,0,0,this.consts.PI2);
        }else{
            this.context.fillStyle = "#D842B8";
            this.context.ellipse(xOffset,this.consts.r16,this.consts.r4,this.consts.r8,0,0,Math.PI);
        }
        this.context.fill();
        this.context.stroke();

    }

    drawAttack(){
        this.context.fillStyle = "#968793";
        this.context.fillRect(this.gameState.facingRight?this.consts.r8*9:this.consts.r8*-17,-this.consts.r8,this.gameState.radius,this.consts.r4);
    }

    draw(){
        this.context.save();
        this.context.translate(this.gameState.xPos%this.canvas.width, this.gameState.yPos%this.canvas.height);
        this.drawBody();
        this.context.restore();
    }

}