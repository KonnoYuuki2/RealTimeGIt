import Item from "./Item.js";
import { currentStage } from "./socket.js";

class ItemController {

    INTERVAL_MIN = 0;
    INTERVAL_MAX = 1500;

    nextInterval = null;
    items = [];
    itemUnlocks = {};


    constructor(ctx, itemImages, scaleRatio, speed, itemUnlocks) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.itemImages = itemImages;
        this.scaleRatio = scaleRatio;
        this.speed = speed;
        this.itemUnlocks = itemUnlocks;

        this.setNextItemTime();
    }

    setNextItemTime() {
        this.nextInterval = this.getRandomNumber(
            this.INTERVAL_MIN,
            this.INTERVAL_MAX
        );
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async createItem() {
        //console.log(currentStage);
       //{ "id":  101, "stage_id": 1000, "item_id": 1 }
       let unlockItem = await this.itemUnlocks.data.filter((element) => {
        //console.log(element);
          return element.stage_id <= currentStage;
       })
       //console.log(unlockItem);
              
        const index = this.getRandomNumber(0, unlockItem.length - 1);

        const itemInfo = this.itemImages[index]; // 아이템의 정보들을 다 가지고 있는 배열
        
        const x = this.canvas.width * 1.5;
        const y = this.getRandomNumber(
            10,
            this.canvas.height - itemInfo.height
        );

        const item = new Item(
            this.ctx,
            itemInfo.id,
            x,
            y,
            itemInfo.width,
            itemInfo.height,
            itemInfo.image
        );

        this.items.push(item);
    }


    update(gameSpeed, deltaTime) {
        if(this.nextInterval <= 0) {
            this.createItem();
            this.setNextItemTime();
        }

        this.nextInterval -= deltaTime;

        this.items.forEach((item) => {
            item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
        })

        this.items = this.items.filter(item => item.x > -item.width);
    }

    draw() {
        this.items.forEach((item) => item.draw());
    }

    collideWith(sprite) {
        const collidedItem = this.items.find(item => item.collideWith(sprite))
        if (collidedItem) {
            this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height)
            return {
                itemId: collidedItem.id
            }
        }
    }

    reset() {
        this.items = [];
    }
}

export default ItemController;