// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var game_scene = require('game_scene');
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
        jumpAudio:{
            type: cc.AudioClip,
            default: null
        },
        jumpStandByAudio:{
            type: cc.AudioClip,
            default: null
        },
        init_speed:150,
        a_power:600,
        y_radio:0.5560472,
        game_manager:{
            type:game_scene,
            default:null,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.jumpStandByAudioId = -1;
        this.jumpAudioId = -1;
        this.next_block = null;
        this.direction = 1;
    },

    player_jump() {
        var x_distance = this.x_distance * this.direction;
        var y_distance = this.x_distance * this.y_radio;

        var target_pos = this.node.getPosition();
        target_pos.x += x_distance;
        target_pos.y += y_distance;

        this.rot_node.runAction(cc.rotateBy(0.5, 360 * this.direction));

        var w_pos = this.node.parent.convertToWorldSpaceAR(target_pos);
        var is_game_over = false;
        if (this.next_block.is_jump_on_block(w_pos, this.direction)) {
            target_pos = this.node.parent.convertToNodeSpaceAR(w_pos)//target_pos就变成了参考点的位置
        }
        else {
            is_game_over = true;
        }
        this.direction = (Math.random() < 0.5) ? -1 : 1;
        var j = cc.jumpTo(0.5, target_pos, 200, 1);
        var end_func = cc.callFunc(function() {
            if (is_game_over) {
                this.game_manager.on_checkout_game();
            }
            else {
                if (this.direction == -1) {
                    this.game_manager.move_map(580 - w_pos.x, -y_distance);
                }
                else {
                    this.game_manager.move_map(180 - w_pos.x, -y_distance);
                }
            }
        }.bind(this));

        var seq = cc.sequence(j, end_func);

        this.node.runAction(seq);

    },

    set_next_block(block) {
        this.next_block = block;
    },

    start () {
        // cc.log("Node Position: " + this.node.name);
        // var children = this.node.children;
        // for (var i = 0; i < children.length; ++i) {
        //     cc.log("Node: " + children[i].name);
        // }
        this.jumpStandByAudioId = -1;
        this.jumpAudioId = -1;        
        this.rot_node = this.node.getChildByName("rotate");
        if (this.rot_node) {
            this.anim_node = this.rot_node.getChildByName("anim");

            this.is_power_mode = false;
            this.speed = 0;
            this.x_distance = 0;

            this.node.parent.parent.on(cc.Node.EventType.TOUCH_START, function(e) {
                this.jumpStandByAudioId = cc.audioEngine.play(this.jumpStandByAudio, false, 1);
                this.is_power_mode = true;
                this.x_distance = 0;
                this.speed = this.init_speed;
                this.anim_node.stopAllActions();
                this.anim_node.runAction(cc.scaleTo(2, 1, 0.5));
            }.bind(this), this);

            this.node.parent.parent.on(cc.Node.EventType.TOUCH_END, function(e) {
                if (this.jumpStandByAudioId != -1) {
                    cc.audioEngine.stop(this.jumpStandByAudioId);
                }
                this.jumpAudioId = cc.audioEngine.play(this.jumpAudio, false, 1);
                this.is_power_mode = false;
                this.anim_node.stopAllActions();
                this.anim_node.runAction(cc.scaleTo(0.5, 1, 1));            
                this.player_jump();
            }.bind(this), this);

            this.node.parent.parent.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
                if (this.jumpStandByAudioId != -1) {
                    cc.audioEngine.stop(this.jumpStandByAudioId);
                }
                this.jumpAudioId = cc.audioEngine.play(this.jumpAudio, false, 1);
                this.is_power_mode = false;
                this.anim_node.stopAllActions();
                this.anim_node.runAction(cc.scaleTo(0.5, 1, 1));
                this.player_jump();
            }.bind(this), this);         
        }
    },

    update (dt) {
        if (this.is_power_mode) {
            this.speed += (this.a_power * dt);
            this.x_distance += this.speed * dt;
        }
    },
});
