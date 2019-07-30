// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        bgAudio:{
            type: cc.AudioClip,
            default: null
        },
        gameoverAudio:{
            type: cc.AudioClip,
            default: null
        },
        player: {
            type: cc.Node,
            default:null,
        },
        block_prefab:{
            default:[],
            type:cc.Prefab,
        },
        block_root:{
            default:null,
            type:cc.Node
        },
        left_org:cc.v2(0,0),

        map_root:{
            type:cc.Node,
            default:null
        },

        y_radio:0.5560472,
        checkout: {
            type:cc.Node,
            default:null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bgAudioId = -1;
        cc.audioEngine.stopAll();
        this.bgAudioId = cc.audioEngine.play(this.bgAudio, false, 1);
    },

    start () {
        
        this.cur_block = cc.instantiate(this.block_prefab[Math.floor(Math.random() * 3)]);
        this.block_root.addChild(this.cur_block);

        this.cur_block.setPosition(this.block_root.convertToNodeSpaceAR(this.left_org));

        var w_pos = this.cur_block.convertToWorldSpaceAR(this.cur_block.getChildByName("mid").position);
        this.player.setPosition(this.map_root.convertToNodeSpaceAR(w_pos));
        this.next_block = this.cur_block;
        this.player_com = this.player.getComponent("player");
        this.block_zorder = -1;
        this.add_block();
    },

    add_block() {
        this.cur_block = this.next_block;
        this.cur_block.zIndex = 0;
        this.next_block = cc.instantiate(this.block_prefab[Math.floor(Math.random() * 3)]);
        this.block_root.addChild(this.next_block);
        this.next_block.zIndex = this.block_zorder;
        this.block_zorder--;

        var x_distance = 200 + Math.random() * 200;
        var y_distance = x_distance * this.y_radio;

        var next_pos = this.cur_block.getPosition();
        next_pos.x += (x_distance * this.player_com.direction);
        next_pos.y += y_distance;

        this.next_block.setPosition(next_pos);
        this.player_com.set_next_block(this.next_block.getComponent("block"));
    
        //删除掉没有用的block
        var children = this.block_root.children;
        if (children.length > 4) {
            this.block_root.removeChild(children[1]);
            cc.log("remove block: ");
        }
    },

    move_map(offset_x, offset_y) {
        var m1 = cc.moveBy(0.5, offset_x, offset_y);
        var end_func = cc.callFunc(function() {
            this.add_block();
        }.bind(this));
        var seq = cc.sequence(m1, end_func);
        this.map_root.runAction(seq);
    },
    on_checkout_game:function() {
        cc.audioEngine.stopAll();
        cc.audioEngine.play(this.gameoverAudio, false, 1);
        this.checkout.active = true;
    },
    on_game_again:function() {
        cc.director.loadScene("game_scene");
    }
    // update (dt) {},
});
