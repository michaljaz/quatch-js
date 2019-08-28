var firebaseConfig = {apiKey: "AIzaSyDyAukafy9CBiSxLjDu_XXh9OBk0bBWUSE",authDomain: "private-notes-d58ba.firebaseapp.com",databaseURL: "https://private-notes-d58ba.firebaseio.com",projectId: "private-notes-d58ba",storageBucket: "private-notes-d58ba.appspot.com",messagingSenderId: "648390504938",appId: "1:648390504938:web:76f941dd0ca1d016"};
firebase.initializeApp(firebaseConfig);

var Q={
	offline:{
		save:function (key,value){
			localStorage.setItem(key,value)
		},
		get:function (key){
			return localStorage.getItem(key)
		}
	},
	ref:function (){
		return firebase.database().ref()
	},
	online:{
		login:function (login){
			Q.online.loginvar=login
		},
		handler:function (){
			if(Q.online.loginvar!=""){
				return Q.ref().child(Q.online.loginvar)
			}
		},
		loginvar:""
	},
	correctBoundPosition:function (sprite,w,h){
		var x=sprite.position.x;
		var y=sprite.position.y;
		if(x<-w/2){
			x=-w/2
		}
		if(x>w/2){
			x=w/2
		}
		if(y>h/2){
			y=h/2
		}
		if(y<-h/2){
			y=-h/2
		}
		sprite.position.x=x
		sprite.position.y=y;
	},
	correctRotation:function (rotation){
		if(rotation%360<0){
			return rotation%360+360
		}
		return rotation%360

	},
	rotateImageData:function (image , rotation)
	{
		rotation=Q.correctRotation(rotation)
		var b=parseFloat($(image).css("width"));
		var a=parseFloat($(image).css("height"))
		if(rotation<90){
			var r=Q.degtorad(90-rotation%90);
		}else if(rotation<180){
			var r=Q.degtorad(rotation%90);
		}else if(rotation<270){
			var r=Q.degtorad(90-rotation%90);
		}else if(rotation<360){
			var r=Q.degtorad(rotation%90);
		}
		
		var A1=b*Math.cos(r);
		var A2=a*Math.sin(r);
		var B1=b*Math.sin(r);
		var B2=a*Math.cos(r);
		var A=A1+A2;
		var B=B1+B2;
		var canvasx=document.createElement("canvas")
		canvasx.width=B
		canvasx.height=A
		var ctx=canvasx.getContext("2d")
		ctx.save()
		ctx.translate(B/2,A/2)
		ctx.rotate(Q.degtorad(rotation))
		ctx.translate(-b/2,-a/2)
		ctx.drawImage(image,0,0,b,a)
		ctx.restore()
		return {data:canvasx.toDataURL(),width:B,height:A}
	},
	uuid:function (){
	  	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	    	return v.toString(16);
	  	});
	},
	degtorad:function (deg){
		return deg/180*Math.PI;
	},
	radtodeg:function (rad){
		return rad*180/Math.PI;
	},
	ac:function (qx,qy,qa,qf){
		qa=Q.degtorad(qa)
		var m_x=-Math.sin(qa)*qf;
		var m_y=-Math.cos(qa)*qf;
		var r_x=qx-m_x;
		var r_y=qy-m_y;
		return {x:r_x,y:r_y};
	},
	Sprite:function (workspace=null){

		this.type="Sprite"
		this.uuid=Q.uuid()
		this.position={x:0,y:0}
		this.visible=true;
		this.costume=null
		this.rotation=90;
		this.width=0;
		this.height=0;
		this.style={}
		this.rotation=0;
		this.stopAtBound=true;
		this.rotationAspect=0;
		this.collisionUpdate=true
		this.clone=function (){
			var clone=new Q.Sprite(this.parent)
			clone.position.x=this.position.x
			clone.position.y=this.position.y
			clone.visible=this.visible
			clone.style=this.style
			clone.stopAtBound=this.stopAtBound
			clone.rotation=this.rotation
			clone.setCostume(this.costume)
			clone.width=this.width
			clone.height=this.height
			clone.rotationAspect=this.rotationAspect
			clone.collisionUpdate=this.collisionUpdate
			return clone
		}
		this.joinAspect=function (sprite,aspectx=0,aspecty=0,aspectr=0){
			sprite.position.x=this.position.x-Math.sin(Q.correctRotation(-this.rotation+180)/180*Math.PI)*aspectx-Math.sin(Q.correctRotation(-this.rotation+90)/180*Math.PI)*aspecty
			sprite.position.y=this.position.y-Math.cos(Q.correctRotation(-this.rotation+180)/180*Math.PI)*aspectx-Math.cos(Q.correctRotation(-this.rotation+90)/180*Math.PI)*aspecty
			sprite.rotation=Q.correctRotation(this.rotation+aspectr)
			return this
		}
		this.setRotationAspect=function (deg){
			this.rotationAspect=deg
			return this
		}
		this.getPosition=function (){
			return [this.position.x,this.position.y]
		}
		this.updateStyle=function (img){
			var _this=this
			Object.keys(this.style).forEach(function (a){
				img.css(a,_this.style[a])
			})
			return this
		}
		this.scale=function (number){
			this.width*=number
			this.height*=number
			return this
		}
		this.hide=function (){
			this.visible=false;
			return this
		}
		this.show=function (){
			this.visible=true;
			return this
		}
		this.move=function (steps){
			var new_pos=Q.ac(this.position.x,this.position.y,-this.rotation+180,steps)
			this.position.x=new_pos.x;
			this.position.y=new_pos.y;
			return this
		}
		this.rotateRight=function (deg){
			this.rotation+=deg
			return this
		}
		this.rotateLeft=function (deg){
			this.rotation-=deg
			return this
		}
		this.rotationTo=function (x,y){
			var roz_x=x-this.position.x;
			var roz_y=y-this.position.y;

			var rotation=-Q.radtodeg(Math.atan(roz_x/roz_y))
			if(roz_x<=0 && roz_y>=0){
				rotation+=180
			}else if(roz_x>=0 && roz_y>=0){
				rotation+=180;
			}
			this.rotation=rotation
			return this
		}
		this.setSize=function (width,height){
			this.width=width;
			this.height=height
			return this
		}
		this.distanceTo=function (x,y){
			var roz_x=Math.abs(this.position.x-x)
			var roz_y=Math.abs(this.position.y-y)
			return Math.sqrt(roz_x*roz_x+roz_y*roz_y)
		}
		this.setCostume=function (name){
			var image=document.querySelector("#tex_"+name)
			this.width=image.width
			this.height=image.height
			this.costume=name
			return this
		}
		this.css=function (attr,val){
			this.style[attr]=val
			return this
		}
		this.moveTo=function (x,y){
			this.position.x=x;
			this.position.y=y
			return this
		}
		this.remove=function (){
			this.parent.remove(this)
		}
		this.addTo=function (parent){
			this.parent=parent
			this.parent.add(this)
			return this
		}
		this.hit=function (sprite){
			return this.parent.touchingPair(this,sprite)
		}
		this.hitBound=function (){
			return this.parent.hitBound(this)
		}
		if(workspace!=null){
			workspace.add(this)
		}
	},
	Workspace:function (title="Q.js Game"){
		this.width=window.innerWidth;
		this.height=window.innerHeight;
		
		this.sprites=[]
		$("body").append("<div class='quatchjs'></div>")
		$("body,html").css("margin","0px")
		$(".quatchjs").append("<div id='rotated'></div>")
		$(".quatchjs").append("<canvas width='"+this.width+"' height='"+this.height+"' style='position:fixed;top:0px;left:0px;'></canvas>")
		$(".quatchjs").append("<div id='sprites'></div>")
		$(".quatchjs").append("<div id='textures' style='display:none'></div>")
		$(".quatchjs").append("<div id='top_bound'></div>")
		$(".quatchjs").append("<div id='left_bound'></div>")
		$(".quatchjs").append("<div id='right_bound'></div>")
		$(".quatchjs").append("<div id='bottom_bound'></div>")
		$("#top_bound").attr("style","position:fixed;top:-1px;left:0px;width:100%;height:1px;z-index:999;background:black")
		$("#left_bound").attr("style","position:fixed;top:0px;left:-1px;width:1px;height:100%;z-index:999;background:black")
		$("#right_bound").attr("style","position:fixed;top:0px;right:-1px;width:1px;height:100%;z-index:999;background:black")
		$("#bottom_bound").attr("style","position:fixed;bottom:-1px;left:0px;width:100%;height:1px;z-index:999;background:black")
		$(".quatchjs").append("<img src='data:image/png;base64,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' style='z-index:100;position:fixed;bottom:5px;right:5px;width:100px;height:20px;'>")
		$("head").append("<title>Q.js</title>")
		$("title").text(title)
		$("head").append("<link rel='icon' href=''>")
		$("link").attr("href","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACJVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAIAAANAAAQAAAPAAAbAABVAACCAACiAAC3AADAAAC/AAC0AACgAACDAABXAAAgAAAVAADYAADvAAD9AAD/AADwAADaAACRAAAaAAADAAA1AADRAAD+AADyAADqAADlAADoAAD7AADWAABBAAAEAAAJAABuAADsAAD8AADMAABNAAArAAAYAAAnAABEAAB1AADDAAD5AAB7AAAKAAACAABlAADtAAAfAAB6AADzAABqAADdAAD0AABTAADiAAAwAAClAACBAABzAAC5AAAFAAA+AAAXAABnAABIAADCAADbAADnAAAMAADSAADpAAAqAABLAADrAABrAAD3AABtAABFAAB0AABKAAAjAACJAACOAAA3AAAcAACUAAAHAAAxAACXAACLAAA8AAAdAAAGAAB+AAAuAACEAABoAAD2AAB5AABeAAD6AABsAABHAAC2AACoAADxAADZAAATAAASAADkAAAZAACjAAB8AACmAAAzAADhAAApAAAvAAAsAACTAACYAACcAACHAAB4AAALAABvAADHAABWAACpAAA6AAA5AADjAABCAACkAABOAAAWAABYAACnAADEAAAiAAB2AAA2AACeAAC+AADOAAAtAACFAADgAAD4AABpAABwAADKAACAAAAeAADFAACKAABGAAArflM7AAAAEHRSTlMAClLA9f7DV5T2+RBdxMdiVlt3lwAAAopJREFUSMeV1vlfEkEUAPBB8QA8ZiWVikwMHgK1SCgYpVbkdlBRFkp20W1WdkqXqYVJ932b3WlZ2d3f1zPoE7Czsft+nH3fnX1vZ2aXEFVOrjqPyog8dX6BihBVoUZOdiK0hTqSoyCfUk0RyVWST2kxUSsDGiKr3pTKCWuUK9NPK9eXcaxrDFBRaZg+Y6ZxVtXsapMMUGOYY7bAn7BYa232LMAxdx6Pmc46l2u+1Q3A1zd4/ge8jQsAfAsNi5rszS2Llyz1A1iXtUoDYfkKvKltZfKmnH0VThJY7ZAEpjUAaxtTR4JmHtatlwJcG4B/gzf1smdjACDULgE68JFrw+k1lhsB3EE2mJqA35TZxk7s8WYHE5i2AGzdlgk82wEiO5hg5y6ANioKAzaikgl27wHYKwb7ePB1sQBnwHe8Xwy63cAfcDCA4yAun0Ni0OMEOHyEATw2BEcZwAxwzMua4TiCE2LQi6XZoqyiT2LHg2Jwigf+tMACZ84C9InBOYD+AWZbB+sAzovBBYDYIBP0DOErupiZP4xNil9iAnoZq76Skc/14eBVygbXsIjrN9LBTVxgsVsSgLuN+/OOPjXfexf33D0qAWjzEA/u+w/+DbQ+xHXxqEISCI8jOMeTkeSeFp5W4f1Hn3GSgEar8bVa4s9fvOTau1+9jvtwLzSknQGig2ykvj9xiCXOMv+bpoyETEDfjhmdPCQj1hWm2QAVmscH3r2fcE3N4Q99yA7+9rjl46dJHiKfhwV5ACP8ZQLPka9j416ZgHp6vwWAnxw1fpcJ8ME6fsQsYBRkA1wcnT9Dv+Q+UiKiNamfCOUfRcWf3XxloIQUaJXka0uV/5wQXVGxRt7vj6akVEd+A+kK7KsQ5KM3AAAAAElFTkSuQmCC")
		console.info("'"+title+"' by Quatch.js (Workspace "+this.width+"x"+this.height+") ")
		this.ctx=document.querySelector("canvas").getContext("2d")
		this.ctx.fillStyle="White"
		this.ctx.fillRect(0,0,this.width,this.height)

		this.cameraview={x:0,y:0}
		var _this=this
		$(document).mousemove(function (z){
			if(z.pageX-this.width/2!=NaN){
				Q.pageX=z.pageX-_this.width/2;
				Q.pageY=z.pageY-_this.height/2;
			}
		})
		$(document).on("contextmenu",function (){
			return false;
		})
		$(document).mouseup(function (z){
			if(z.which==1){
				Q.mouse.left=false;
			}else if(z.which==2){
				Q.mouse.middle=false;
			}else if(z.which==3){
				Q.mouse.right=false;
			}
		})
		$(document).mousedown(function (z){
			if(z.which==1){
				Q.mouse.left=true;
			}else if(z.which==2){
				Q.mouse.middle=true;
			}else if(z.which==3){
				Q.mouse.right=true;
			}
			return false
		})
		$(document).on("drop",function (z){
			return false
		})
		$(document).keydown(function (z){
			Q.keys[z.key]=true
			Q.keyx=z.key
			Q.askeys[z.keyCode]=true
		})
		$(document).keyup(function (z){
			delete Q.keys[z.key]
			delete Q.askeys[z.keyCode]
		})
		this.hitBound=function (sprite){
			var w=$(".rot_"+sprite.uuid).objectHitTest({"object":$("#top_bound"), "transparency":true});
			var s=$(".rot_"+sprite.uuid).objectHitTest({"object":$("#bottom_bound"), "transparency":true});
			var a=$(".rot_"+sprite.uuid).objectHitTest({"object":$("#left_bound"), "transparency":true});
			var d=$(".rot_"+sprite.uuid).objectHitTest({"object":$("#right_bound"), "transparency":true});
			var gen=w || s || a || d
			return {ok:gen,ex:{top:w,bottom:s,right:d,left:a}}
		}
		this.init=function (f){
			this.initf=f
		}
		this.randomPlace=function (){
			return [Math.random()*this.width-this.width/2,Math.random()*this.height-this.height/2]
		}
		this.loadTextures=function (map,f=null){
			var ile=0
			Object.keys(map).forEach(function (z){
				console.warn("Image '"+map[z]+"' loaded as "+z)
				$("#textures").append(`<img src='${map[z]}' id='tex_${z}'>`)
				ile++
			})
			var ile2=0;
			var _this=this
			Object.keys(map).forEach(function (z){
				$(`#tex_${z}`).on("load",function (){
					ile2++
					if(ile2==ile){
						try{
							var czy=false
							Q.ref().on('value',function (abc) {
								if(abc.val()[0]==0 && czy==false){
									czy=true
									if(f==null){
										_this.initf()
									}else{
										f()
									}
								}
							})
							
						}catch(e){}
						
					}
				})
			})
			return this
		}
		this.setBackground=function (color){
			this.ctx.fillStyle=color
			this.ctx.fillRect(0,0,this.width,this.height)
			return this
		}
		this.getid=function (obj){
			var saved;
			for(var i=0;i<this.sprites.length;i++){
				var sprite=this.sprites[i];
				if(obj.uuid==this.sprites[i].uuid){
					saved=i;
				}
			}
			return saved;
		}
		this.add=function (sprite){
			this.sprites.push(sprite)
			$("#sprites").append("<img class='img_"+sprite.uuid+"' style='position:fixed;z-index:99;'>")
			$("#rotated").append("<img class='rot_"+sprite.uuid+"' style='position:fixed;z-index:-99'>")
			sprite.parent=this
			return this
		}
		this.remove=function (sprite){
			this.sprites.splice(this.getid(sprite),1)
			delete sprite.parent;
			$(".img_"+sprite.uuid).remove()
			$(".rot_"+sprite.uuid).remove()
			return this
		}
		this.mouseOver=function (sprite){
			return $(".rot_"+sprite.uuid).hitTestPoint({"x":(Q.mouse.x+this.width/2),"y":(Q.mouse.y+this.height/2), "transparency":true})	
		}
		this.touchingPair=function (sprite1,sprite2){
			return $(".rot_"+sprite1.uuid).objectHitTest({"object":$(".rot_"+sprite2.uuid), "transparency":true});
		}
		this.ticker=function (f){
			this.tickf=f
			return this
		}
		this.tickerAfter=function (f){
			this.tickf2=f
			return this
		}
		this.animateTicker=function (){
			Q.Animate(this)
			return this
		}
		this.moveCamera=function (x,y){
			this.cameraview.x+=x
			this.cameraview.y+=y
			return this
		}
		this.setCamera=function (x,y){
			this.cameraview.x=x
			this.cameraview.y=y
			return this
		}
		this.render=function (){
			Q.mouse.x=Q.pageX+this.cameraview.x;
			Q.mouse.y=Q.pageY+this.cameraview.y
			TWEEN.update()
			try{
				this.tickf()
			}catch(e){}
			for(var i=0;i<this.sprites.length;i++){
				var sprite=this.sprites[i]
				var img=$(".img_"+sprite.uuid);
				if(sprite.visible && sprite.costume!=null){
					if(sprite.stopAtBound){
						Q.correctBoundPosition(sprite,this.width,this.height)
					}
					img.css("visibility","visible")
					sprite.updateStyle(img)
					img.css("width",sprite.width)
					img.css("height",sprite.height)
					img.css("left",sprite.position.x-sprite.width/2+this.width/2-this.cameraview.x)
					img.css("top",sprite.position.y-sprite.height/2+this.height/2-this.cameraview.y)
					img.css("transform","rotate("+(sprite.rotation+sprite.rotationAspect)+"deg)")
					img.attr("src",document.querySelector("#tex_"+sprite.costume).src)
					if(sprite.collisionUpdate){
						var imgData=Q.rotateImageData(document.querySelector(".img_"+sprite.uuid),sprite.rotation+sprite.rotationAspect);
						var rot=$(".rot_"+sprite.uuid);

						rot.css("width",imgData.width)
						rot.css("height",imgData.height)
						rot.css("left",sprite.position.x-imgData.width/2+this.width/2-this.cameraview.x)
						rot.css("top",sprite.position.y-imgData.height/2+this.height/2-this.cameraview.y)
						rot.attr("src",imgData.data)
					}
					
				}else{
					img.css("visibility","hidden")
				}
			}
			try{
				this.tickf2()
			}catch(e){}
			
		}
	},
	Queue:function ii(){
		this.queuex=[]
		this.queue=[]
		this.add=function (f){
			this.queue.push(f)
			this.queuex.push(f)
			return this
		}
		this.sleep=function (time){
			this.queue.push(time)
			this.queuex.push(time)

			return this
		}
		this.remove=function (){
			this.queue.shift()
		}
		this.next=function (){
			this.remove()
			this.start()
		}
		this.loop=function (){
			this.queue.push("loop")
			this.queuex.push("loop")
			return this
		}
		this.start=function (){
			var _this=this
			if(this.queue.length!=undefined){
				if(typeof this.queue[0]=="function"){
					this.queue[0]()
					this.next()
				}else if(typeof this.queue[0]=="number"){
					setTimeout(function (){
						_this.next()
					},this.queue[0])
				}else if(typeof this.queue[0]=="string"){
					this.queue=[]
					for(var i=0;i<this.queuex.length;i++){
						this.queue.push(this.queuex[i])
					}
					if(this.queue.length!=1){
						this.start()
					}	
				}
			}
		}
	},
	Debugger:function (){
		$("body").append("<div id='DEB'></div>")
		$("#DEB").attr("style","position:fixed;top:0px;right:0px;background:black;color:white")
		$("#DEB").html("Empty")
		var _this=this
		$("#DEB").click(function (){
			_this.hide()
		})
		$(document).mousedown(function (){
			if(Q.mouse.middle){
				_this.show()
			}
		})
		this.update=function (map){
			$("#DEB").html("<font color='red'>Q.js</font> debugger<br><br>")
			Object.keys(map).forEach(function (z){
				$("#DEB").append("<font color='green'>"+z+"</font> : "+map[z]+"<br>")
			})
			return this
		}
		this.hide=function (){
			$("#DEB").slideUp(100)
			return this
		}
		this.show=function (){
			$("#DEB").slideDown(100)
			return this
		}
	},
	mouse:{x:100,y:100,right:false,left:false,middle:false},
	pageX:100,
	pageY:100,
	keys:{},
	askeys:{},
	current:{millis:0,second:0,minute:0,hour:0,dayOfWeek:0,date:0,month:0,year:0},
	Animate:function (workspc){
		function animate(){
			requestAnimationFrame(animate)
			workspc.render()
		}animate()
	}
}
