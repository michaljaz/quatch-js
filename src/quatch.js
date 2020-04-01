//Quatch.js dev
$("head").append("<link rel='stylesheet' href='../../src/quatch_style.css'>")
var Q = {
  Draw: function(width, height) {
    this.canvas = document.createElement("canvas");

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.edit = function(f) {
      f(this.ctx);
      return {
        data: this.canvas.toDataURL(),
        width: this.canvas.width,
        height: this.canvas.height
      };
    };
  },
  offline: {
    save: function(key, value) {
      localStorage.setItem(key, value);
    },
    get: function(key) {
      return localStorage.getItem(key);
    }
  },
  correctBoundPosition: function(sprite, w, h) {
    var x = sprite.position.x;
    var y = sprite.position.y;
    if (x < -w / 2) {
      x = -w / 2;
    }
    if (x > w / 2) {
      x = w / 2;
    }
    if (y > h / 2) {
      y = h / 2;
    }
    if (y < -h / 2) {
      y = -h / 2;
    }
    sprite.position.x = x;
    sprite.position.y = y;
  },
  correctRotation: function(rotation) {
    if (rotation % 360 < 0) {
      return (rotation % 360) + 360;
    }
    return rotation % 360;
  },
  rotateImageData: function(image, rotation) {
    rotation = Q.correctRotation(rotation);
    var b = parseFloat($(image).css("width"));
    var a = parseFloat($(image).css("height"));
    if (rotation < 90) {
      var r = Q.degtorad(90 - (rotation % 90));
    } else if (rotation < 180) {
      var r = Q.degtorad(rotation % 90);
    } else if (rotation < 270) {
      var r = Q.degtorad(90 - (rotation % 90));
    } else if (rotation < 360) {
      var r = Q.degtorad(rotation % 90);
    }

    var A1 = b * Math.cos(r);
    var A2 = a * Math.sin(r);
    var B1 = b * Math.sin(r);
    var B2 = a * Math.cos(r);
    var A = A1 + A2;
    var B = B1 + B2;
    var canvasx = document.createElement("canvas");
    canvasx.width = B;
    canvasx.height = A;
    var ctx = canvasx.getContext("2d");
    ctx.save();
    ctx.translate(B / 2, A / 2);
    ctx.rotate(Q.degtorad(rotation));
    ctx.translate(-b / 2, -a / 2);
    ctx.drawImage(image, 0, 0, b, a);
    ctx.restore();
    return { data: canvasx.toDataURL(), width: B, height: A };
  },
  uuid: function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  degtorad: function(deg) {
    return (deg / 180) * Math.PI;
  },
  radtodeg: function(rad) {
    return (rad * 180) / Math.PI;
  },
  ac: function(qx, qy, qa, qf) {
    qa = Q.degtorad(qa);
    var m_x = -Math.sin(qa) * qf;
    var m_y = -Math.cos(qa) * qf;
    var r_x = qx - m_x;
    var r_y = qy - m_y;
    return { x: r_x, y: r_y };
  },
  Sprite: function(workspace = null) {
    this.type = "Sprite";
    this.uuid = Q.uuid();
    this.position = { x: 0, y: 0 };
    this.visible = true;
    this.costume = null;
    this.rotation = 0;
    this.width = 0;
    this.height = 0;
    this.style = {};
    this.stopAtBound = true;
    this.rotationAspect = 0;
    this.collisionUpdate = true;
    this.clone = function() {
      var clone = new Q.Sprite(this.parent);
      clone.position.x = this.position.x;
      clone.position.y = this.position.y;
      clone.visible = this.visible;
      clone.style = {};
      var _this = this;
      Object.keys(this.style).forEach(function(z) {
        clone.style[z] = _this.style[z];
      });
      clone.stopAtBound = this.stopAtBound;
      clone.rotation = this.rotation;
      clone.setCostume(this.costume);
      clone.width = this.width;
      clone.height = this.height;
      clone.rotationAspect = this.rotationAspect;
      clone.collisionUpdate = this.collisionUpdate;
      return clone;
    };
    this.joinAspect = function(sprite, aspectx = 0, aspecty = 0, aspectr = 0) {
      sprite.position.x =
        this.position.x -
        Math.sin((Q.correctRotation(-this.rotation + 180) / 180) * Math.PI) *
          aspectx -
        Math.sin((Q.correctRotation(-this.rotation + 90) / 180) * Math.PI) *
          aspecty;
      sprite.position.y =
        this.position.y -
        Math.cos((Q.correctRotation(-this.rotation + 180) / 180) * Math.PI) *
          aspectx -
        Math.cos((Q.correctRotation(-this.rotation + 90) / 180) * Math.PI) *
          aspecty;
      sprite.rotation = Q.correctRotation(this.rotation + aspectr);
      return this;
    };
    this.setRotationAspect = function(deg) {
      this.rotationAspect = deg;
      return this;
    };
    this.getPosition = function() {
      return [this.position.x, this.position.y];
    };
    this.updateStyle = function(img) {
      var _this = this;
      Object.keys(this.style).forEach(function(a) {
        img.css(a, _this.style[a]);
      });
      return this;
    };
    this.scale = function(number) {
      this.width *= number;
      this.height *= number;
      return this;
    };
    this.hide = function() {
      this.visible = false;
      return this;
    };
    this.show = function() {
      this.visible = true;
      return this;
    };
    this.move = function(steps) {
      var new_pos = Q.ac(
        this.position.x,
        this.position.y,
        -this.rotation + 180,
        steps
      );
      this.position.x = new_pos.x;
      this.position.y = new_pos.y;
      return this;
    };
    this.rotateRight = function(deg) {
      this.rotation += deg;
      return this;
    };
    this.rotateLeft = function(deg) {
      this.rotation -= deg;
      return this;
    };
    this.rotationTo = function(x, y) {
      var roz_x = x - this.position.x;
      var roz_y = y - this.position.y;

      var rotation = -Q.radtodeg(Math.atan(roz_x / roz_y));
      if (roz_x <= 0 && roz_y >= 0) {
        rotation += 180;
      } else if (roz_x >= 0 && roz_y >= 0) {
        rotation += 180;
      }
      this.rotation = rotation;
      return this;
    };
    this.setSize = function(width, height) {
      this.width = width;
      this.height = height;
      return this;
    };
    this.distanceTo = function(x, y) {
      var roz_x = Math.abs(this.position.x - x);
      var roz_y = Math.abs(this.position.y - y);
      return Math.sqrt(roz_x * roz_x + roz_y * roz_y);
    };
    this.setCostume = function(name) {
      var image = document.querySelector("#tex_" + name);
      this.width = image.width;
      this.height = image.height;
      this.costume = name;
      return this;
    };
    this.css = function(attr, val) {
      this.style[attr] = val;
      return this;
    };
    this.moveTo = function(x, y) {
      this.position.x = x;
      this.position.y = y;
      return this;
    };
    this.remove = function() {
      this.parent.remove(this);
    };
    this.addTo = function(parent) {
      this.parent = parent;
      this.parent.add(this);
      return this;
    };
    this.hit = function(sprite) {
      return this.parent.touchingPair(this, sprite);
    };
    this.hitBound = function() {
      return this.parent.hitBound(this);
    };
    if (workspace != null) {
      workspace.add(this);
    }
  },
  Workspace: function(title = "Q.js Game") {
    this.title=title
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.sprites = [];
    $("body").append(`
<div class='quatchjs'>
  <div id='rotated'></div>
  <canvas class='main_canvas' width='${this.width}' height='${this.height}' style='position:fixed;top:0px;left:0px;'></canvas>
  <canvas class='movable_canvas' width='${this.width*10}' height='${this.height*10}' style='position:fixed;top:0px;left:0px;'></canvas>
  <div id='sprites'></div>
  <div id='textures' style='display:none'></div>
  <div id='top_bound'></div>
  <div id='left_bound'></div>
  <div id='right_bound'></div>
  <div id='bottom_bound'></div>
</div>
`);
    $("#top_bound").attr(
      "style",
      "position:fixed;top:-1px;left:0px;width:100%;height:1px;z-index:999;background:black"
    );
    $("#left_bound").attr(
      "style",
      "position:fixed;top:0px;left:-1px;width:1px;height:100%;z-index:999;background:black"
    );
    $("#right_bound").attr(
      "style",
      "position:fixed;top:0px;right:-1px;width:1px;height:100%;z-index:999;background:black"
    );
    $("#bottom_bound").attr(
      "style",
      "position:fixed;bottom:-1px;left:0px;width:100%;height:1px;z-index:999;background:black"
    );
    $("head").append("<title>Q.js</title>");
    $("title").text(this.title);
    console.info(`${this.title} by Quatch.js (Workspace ${this.width}x${this.height})`);
    this.ctx = document.querySelector(".main_canvas").getContext("2d");
    this.ctx.fillStyle = "White";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.m_ctx=document.querySelector(".movable_canvas").getContext("2d");
    this.m_view={x:0,y:0}

    this.cameraview = { x: 0, y: 0 };
    var _this = this;
    $(document).mousemove(function(z) {
      if (z.pageX - this.width / 2 != NaN) {
        Q.pageX = z.pageX - _this.width / 2;
        Q.pageY = z.pageY - _this.height / 2;
      }
    });
    $(document).on("contextmenu", function() {
      return false;
    });
    $(document).mouseup(function(z) {
      if (z.which == 1) {
        Q.mouse.left = false;
      } else if (z.which == 2) {
        Q.mouse.middle = false;
      } else if (z.which == 3) {
        Q.mouse.right = false;
      }
    });
    $(document).mousedown(function(z) {
      if (z.which == 1) {
        Q.mouse.left = true;
      } else if (z.which == 2) {
        Q.mouse.middle = true;
      } else if (z.which == 3) {
        Q.mouse.right = true;
      }
      return false;
    });
    $(document).on("drop", function(z) {
      return false;
    });
    $(document).keydown(function(z) {
      Q.keys[z.key] = true;
      Q.keyx = z.key;
      Q.askeys[z.keyCode] = true;
    });
    $(document).keyup(function(z) {
      delete Q.keys[z.key];
      delete Q.askeys[z.keyCode];
    });
    this.hitBound = function(sprite) {
      var w = $(".rot_" + sprite.uuid).objectHitTest({
        object: $("#top_bound"),
        transparency: true
      });
      var s = $(".rot_" + sprite.uuid).objectHitTest({
        object: $("#bottom_bound"),
        transparency: true
      });
      var a = $(".rot_" + sprite.uuid).objectHitTest({
        object: $("#left_bound"),
        transparency: true
      });
      var d = $(".rot_" + sprite.uuid).objectHitTest({
        object: $("#right_bound"),
        transparency: true
      });
      var gen = w || s || a || d;
      return { ok: gen, ex: { top: w, bottom: s, right: d, left: a } };
    };
    this.init = function(f) {
      this.initFunction = f;
    };
    this.randomPlace = function() {
      return [
        Math.random() * this.width - this.width / 2,
        Math.random() * this.height - this.height / 2
      ];
    };
    this.loadTextures = function(map) {
      var ile = 0;
      $("body").append(`<div class="startbar" style='color:red;font-weight:bold;font-size:40px;width:100%;height:100%;background:black;z-index:9999;position:fixed;top:0px;left:0px;'><div style='text-align:center;position: absolute;width: 300px;height: 300px;top: 50%;left: 50%;margin-left: -150px; /* margin is -0.5 * dimension */margin-top: -150px; z-index:99999999999;'>
${this.title}<br>
<div style="font-weight:normal;font-size:20px;">Powered by Quatch.js</div><br>
<span class="cssload-loader"><span class="cssload-loader-inner"></span></span>
        </div></div>`)
      Object.keys(map).forEach(function(z) {
        console.warn("Image '" + map[z] + "' loaded as " + z);
        $("#textures").append(`<img src='${map[z]}' id='tex_${z}'>`);
        ile++;
      });
      var ile2 = 0;
      var _this = this;
      Object.keys(map).forEach(function(z) {
        $(`#tex_${z}`).on("load", function() {
          ile2++;
          if (ile2 == ile) {
            setTimeout(function (){
                $(".startbar").css("display","none")
                console.log('Init function started')
                try {
                  _this.initFunction();
                } catch (e) {}
            },2000)
            
          }
        });
      });
      return this;
    };
    this.setBackground = function(color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
      return this;
    };
    this.getid = function(obj) {
      var saved;
      for (var i = 0; i < this.sprites.length; i++) {
        var sprite = this.sprites[i];
        if (obj.uuid == this.sprites[i].uuid) {
          saved = i;
        }
      }
      return saved;
    };
    this.add = function(sprite) {
      this.sprites.push(sprite);
      $("#sprites").append(`<img crossOrigin='Anonymous' class='img_${sprite.uuid}'style='position:fixed;z-index:99;'>`);
      $("#rotated").append(`<img class='rot_${sprite.uuid}' style='position:fixed;z-index:-99'>`)
      sprite.parent = this;
      return this;
    };
    this.remove = function(sprite) {
      this.sprites.splice(this.getid(sprite), 1);
      delete sprite.parent;
      $(".img_" + sprite.uuid).remove();
      $(".rot_" + sprite.uuid).remove();
      return this;
    };
    this.mouseOver = function(sprite) {
      return $(".rot_" + sprite.uuid).hitTestPoint({
        x: Q.mouse.x + this.width / 2,
        y: Q.mouse.y + this.height / 2,
        transparency: true
      });
    };
    this.touchingPair = function(sprite1, sprite2) {
      try{
        return $(".rot_" + sprite1.uuid).objectHitTest({
          object: $(".rot_" + sprite2.uuid),
          transparency: true
        });
      }catch(e){
        return false;
      }
      
    };
    this.ticker = function(f) {
      this.tickf = f;
      return this;
    };
    this.tickerAfter = function(f) {
      this.tickf2 = f;
      return this;
    };
    this.animateTicker = function() {
      Q.Animate(this);
      return this;
    };
    this.moveCamera = function(x, y) {
      this.cameraview.x += x;
      this.cameraview.y += y;
      return this;
    };
    this.setCamera = function(x, y) {
      this.cameraview.x = x;
      this.cameraview.y = y;
      return this;
    };
    this.m_set = function (x,y){
      this.m_view.x=x;
      this.m_view.y=y;
    }
    this.m_move=function (x,y){
      this.m_view.x+=x;
      this.m_view.y+=y;
    }
    this.render = function() {
      $(".movable_canvas").css("left",this.m_view.x)
      $(".movable_canvas").css("top",this.m_view.y)
      Q.mouse.x = Q.pageX + this.cameraview.x;
      Q.mouse.y = Q.pageY + this.cameraview.y;
      TWEEN.update();
      try {
        this.tickf();
      } catch (e) {}
      for (var i = 0; i < this.sprites.length; i++) {
        var sprite = this.sprites[i];
        var img = $(".img_" + sprite.uuid);
        if (sprite.visible && sprite.costume != null) {
          if (sprite.stopAtBound) {
            Q.correctBoundPosition(sprite, this.width, this.height);
          }
          img.css("visibility", "visible");
          sprite.updateStyle(img);
          img.css("width", sprite.width);
          img.css("height", sprite.height);
          img.css(
            "left",
            sprite.position.x -
              sprite.width / 2 +
              this.width / 2 -
              this.cameraview.x
          );
          img.css(
            "top",
            sprite.position.y -
              sprite.height / 2 +
              this.height / 2 -
              this.cameraview.y
          );
          img.css(
            "transform",
            "rotate(" + (sprite.rotation + sprite.rotationAspect) + "deg)"
          );
          img.attr("src", document.querySelector("#tex_" + sprite.costume).src);
          if (sprite.collisionUpdate) {
            var imgData = Q.rotateImageData(
              document.querySelector(".img_" + sprite.uuid),
              sprite.rotation + sprite.rotationAspect
            );

            var rot = $(".rot_" + sprite.uuid);

            rot.css("width", imgData.width);
            rot.css("height", imgData.height);
            rot.css(
              "left",
              sprite.position.x -
                imgData.width / 2 +
                this.width / 2 -
                this.cameraview.x
            );
            rot.css(
              "top",
              sprite.position.y -
                imgData.height / 2 +
                this.height / 2 -
                this.cameraview.y
            );
            rot.attr("src", imgData.data);
          }
        } else {
          img.css("visibility", "hidden");
        }
      }
      try {
        this.tickf2();
      } catch (e) {}
    };
  },
  Queue: function ii() {
    this.queuex = [];
    this.queue = [];
    this.add = function(f) {
      this.queue.push(f);
      this.queuex.push(f);
      return this;
    };
    this.sleep = function(time) {
      this.queue.push(time);
      this.queuex.push(time);

      return this;
    };
    this.remove = function() {
      this.queue.shift();
    };
    this.next = function() {
      this.remove();
      this.start();
    };
    this.loop = function() {
      this.queue.push("loop");
      this.queuex.push("loop");
      return this;
    };
    this.start = function() {
      var _this = this;
      if (this.queue.length != undefined) {
        if (typeof this.queue[0] == "function") {
          this.queue[0]();
          this.next();
        } else if (typeof this.queue[0] == "number") {
          setTimeout(function() {
            _this.next();
          }, this.queue[0]);
        } else if (typeof this.queue[0] == "string") {
          this.queue = [];
          for (var i = 0; i < this.queuex.length; i++) {
            this.queue.push(this.queuex[i]);
          }
          if (this.queue.length != 1) {
            this.start();
          }
        }
      }
    };
  },
  Debugger: function() {
    $("body").append("<div id='DEB'></div>");
    $("#DEB").attr(
      "style",
      "position:fixed;top:0px;right:0px;background:black;color:white"
    );
    $("#DEB").html("Empty");
    var _this = this;
    $("#DEB").click(function() {
      _this.hide();
    });
    $(document).mousedown(function() {
      if (Q.mouse.middle) {
        _this.show();
      }
    });
    this.update = function(map) {
      $("#DEB").html("<font color='red'>Q.js</font> debugger<br><br>");
      Object.keys(map).forEach(function(z) {
        $("#DEB").append(
          "<font color='green'>" + z + "</font> : " + map[z] + "<br>"
        );
      });
      return this;
    };
    this.hide = function() {
      $("#DEB").slideUp(100);
      return this;
    };
    this.show = function() {
      $("#DEB").slideDown(100);
      return this;
    };
  },
  mouse: { x: 100, y: 100, right: false, left: false, middle: false },
  pageX: 100,
  pageY: 100,
  keys: {},
  askeys: {},
  current: {
    millis: 0,
    second: 0,
    minute: 0,
    hour: 0,
    dayOfWeek: 0,
    date: 0,
    month: 0,
    year: 0
  },
  Animate: function(workspc) {
    function animate() {
      requestAnimationFrame(animate);
      workspc.render();
    }
    animate();
  }
};
