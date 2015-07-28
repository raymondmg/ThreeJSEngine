<script>
		  <!--检测当前浏览器是否支持webgl-->
			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container, stats, permalink, hex, color;

			var camera, cameraTarget, scene, renderer;

			var composer;
			var effectFXAA;

			var group, textMesh1, textMesh2, textGeo, material;

			var firstLetter = true;
		<!--显示字体内容 以及大小高低设置-->
			var text = "Test",

				height = 20,
				size = 70,
				hover = 30,

				curveSegments = 4,

				bevelThickness = 2,
				bevelSize = 1.5,
				bevelSegments = 3,
				bevelEnabled = true,

				font = "optimer", // 字体选择
				weight = "bold", // 正常
				style = "normal"; // 正常的样式

			var mirror = true;

			var fontMap = {

				"helvetiker": 0,
				"optimer": 1,
				"gentilis": 2,
				"droid sans": 3,
				"droid serif": 4

			};

			var weightMap = {

				"normal": 0,
				"bold": 1

			};

			var reverseFontMap = {};
			var reverseWeightMap = {};

			for ( var i in fontMap ) reverseFontMap[ fontMap[i] ] = i;
			for ( var i in weightMap ) reverseWeightMap[ weightMap[i] ] = i;

			var targetRotation = 0;
			var targetRotationOnMouseDown = 0;

			var mouseX = 0;
			var mouseXOnMouseDown = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var postprocessing = { enabled : false };
			var glow = 0.9;

			<!--初始化-->
			init();
			animate();

			
			<!--将文本大写并拼接字符串-->
			function capitalize( txt ) {

				return txt.substring( 0, 1 ).toUpperCase() + txt.substring( 1 );

			}
			<!--TODO-->
			function decimalToHex( d ) {

				var hex = Number( d ).toString( 16 );
				hex = "000000".substr( 0, 6 - hex.length ) + hex;
				return hex.toUpperCase();

			}

			<!--初始化-->
			function init() {

			//创建一个div的元素赋值为容器，在整个文档之中将该容器放置-
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				permalink = document.getElementById( "permalink" );

				// 相机     当前为正交相机

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
				camera.position.set( 0, 400, 700 );

				cameraTarget = new THREE.Vector3( 0, 150, 0 );

				// 场景

				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

				// 灯光

				var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
				dirLight.position.set( 0, 0, 1 ).normalize();
				scene.add( dirLight );

				var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
				pointLight.position.set( 0, 100, 90 );
				scene.add( pointLight );
				
				// 读取 #后字符 的信息来对当前页面的一些效果进行修改

				var hash = document.location.hash.substr( 1 );

				if ( hash.length !== 0 ) {

					var colorhash  = hash.substring( 0, 6 );
					var fonthash   = hash.substring( 6, 7 );
					var weighthash = hash.substring( 7, 8 );
					var pphash 	   = hash.substring( 8, 9 );
					var bevelhash  = hash.substring( 9, 10 );
					var texthash   = hash.substring( 10 );

					hex = colorhash;
					pointLight.color.setHex( parseInt( colorhash, 16 ) );

					font = reverseFontMap[ parseInt( fonthash ) ];
					weight = reverseWeightMap[ parseInt( weighthash ) ];

					postprocessing.enabled = parseInt( pphash );
					bevelEnabled = parseInt( bevelhash );

					text = decodeURI( texthash );

					updatePermalink();

				} else {

					pointLight.color.setHSL( Math.random(), 1, 0.5 );
					hex = decimalToHex( pointLight.color.getHex() );

				}

				//材质
				material = new THREE.MeshFaceMaterial( [
					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // 字体材质
					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // 侧面旁边材质
				] );
				
				//
				group = new THREE.Group();
				group.position.y = 100;

				scene.add( group );
				
				//创建字体
				createText();
				
				
				//创建平面
				var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 10000, 10000 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
				);
				plane.position.y = 100;
				plane.rotation.x = - Math.PI / 2;
				scene.add( plane );

				// 渲染

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setClearColor( scene.fog.color );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
				container.appendChild( renderer.domElement );

				// 显示刷新

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';

				// 事件监听

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'keypress', onDocumentKeyPress, false );
				document.addEventListener( 'keydown', onDocumentKeyDown, false );
				//具体改变效果的监听
				document.getElementById( "color" ).addEventListener( 'click', function() {

					pointLight.color.setHSL( Math.random(), 1, 0.5 );
					hex = decimalToHex( pointLight.color.getHex() );

					updatePermalink();

				}, false );

				document.getElementById( "font" ).addEventListener( 'click', function() {

					if ( font == "helvetiker" ) {

						font = "optimer";

					} else if ( font == "optimer" ) {

						font = "gentilis";

					} else if ( font == "gentilis" ) {

						font = "droid sans";

					} else if ( font == "droid sans" ) {

						font = "droid serif";

					} else {

						font = "helvetiker";

					}

					refreshText();

				}, false );

				document.getElementById( "weight" ).addEventListener( 'click', function() {

					if ( weight == "bold" ) {

						weight = "normal";

					} else {

						weight = "bold";

					}

					refreshText();

				}, false );

				document.getElementById( "bevel" ).addEventListener( 'click', function() {

					bevelEnabled = !bevelEnabled;

					refreshText();

				}, false );

				document.getElementById( "postprocessing" ).addEventListener( 'click', function() {

					postprocessing.enabled = !postprocessing.enabled;
					updatePermalink();

				}, false );


				// 再加工

				renderer.autoClear = false;
				//渲染通道
				var renderModel = new THREE.RenderPass( scene, camera );
				//泛光
				var effectBloom = new THREE.BloomPass( 0.25 );
				//电影效果
				var effectFilm = new THREE.FilmPass( 0.5, 0.125, 2048, false );
				//着色器
				effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
				//获取窗体的宽和高
				var width = window.innerWidth || 2;
				var height = window.innerHeight || 2;

				effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

				effectFilm.renderToScreen = true;

				composer = new THREE.EffectComposer( renderer );
				//将以上几种再次处理的效果添加
				composer.addPass( renderModel );
				composer.addPass( effectFXAA );
				composer.addPass( effectBloom );
				composer.addPass( effectFilm );

				//重置窗体大小

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				composer.reset();

				effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

			}

			//

			function boolToNum( b ) {

				return b ? 1 : 0;

			}
			//更新#后的数据信息
			function updatePermalink() {

				var link = hex + fontMap[ font ] + weightMap[ weight ] + boolToNum( postprocessing.enabled ) + boolToNum( bevelEnabled ) + "#" + encodeURI( text );

				permalink.href = "#" + link;
				window.location.hash = link;

			}
			//当按键按下之后
			function onDocumentKeyDown( event ) {

				if ( firstLetter ) {

					firstLetter = false;
					text = "";

				}

				var keyCode = event.keyCode;

				// backspace

				if ( keyCode == 8 ) {

					event.preventDefault();

					text = text.substring( 0, text.length - 1 );
					refreshText();

					return false;

				}

			}
			//按键释放
			function onDocumentKeyPress( event ) {

				var keyCode = event.which;

				// backspace

				if ( keyCode == 8 ) {

					event.preventDefault();

				} else {

					var ch = String.fromCharCode( keyCode );
					text += ch;

					refreshText();

				}

			}
			//创建字体
			function createText() {

				textGeo = new THREE.TextGeometry( text, {

					size: size,
					height: height,
					curveSegments: curveSegments,

					font: font,
					weight: weight,
					style: style,

					bevelThickness: bevelThickness,
					bevelSize: bevelSize,
					bevelEnabled: bevelEnabled,

					material: 0,
					extrudeMaterial: 1

				});

				textGeo.computeBoundingBox();
				textGeo.computeVertexNormals();

				// 修复法线

				if ( ! bevelEnabled ) {

					var triangleAreaHeuristics = 0.1 * ( height * size );

					for ( var i = 0; i < textGeo.faces.length; i ++ ) {

						var face = textGeo.faces[ i ];

						if ( face.materialIndex == 1 ) {

							for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

								face.vertexNormals[ j ].z = 0;
								face.vertexNormals[ j ].normalize();

							}

							var va = textGeo.vertices[ face.a ];
							var vb = textGeo.vertices[ face.b ];
							var vc = textGeo.vertices[ face.c ];

							var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

							if ( s > triangleAreaHeuristics ) {

								for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

									face.vertexNormals[ j ].copy( face.normal );

								}

							}

						}

					}

				}

				var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

				textMesh1 = new THREE.Mesh( textGeo, material );

				textMesh1.position.x = centerOffset;
				textMesh1.position.y = hover;
				textMesh1.position.z = 0;

				textMesh1.rotation.x = 0;
				textMesh1.rotation.y = Math.PI * 2;

				group.add( textMesh1 );
				
				//镜面效果
				if ( mirror ) {

					textMesh2 = new THREE.Mesh( textGeo, material );

					textMesh2.position.x = centerOffset;
					textMesh2.position.y = -hover;
					textMesh2.position.z = height;

					textMesh2.rotation.x = Math.PI;
					textMesh2.rotation.y = Math.PI * 2;

					group.add( textMesh2 );

				}

			}
			//刷新显示字的内容
			function refreshText() {

				updatePermalink();

				group.remove( textMesh1 );
				if ( mirror ) group.remove( textMesh2 );

				if ( !text ) return;

				createText();

			}
			//鼠标按下
			function onDocumentMouseDown( event ) {

				event.preventDefault();

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mouseout', onDocumentMouseOut, false );

				mouseXOnMouseDown = event.clientX - windowHalfX;
				targetRotationOnMouseDown = targetRotation;

			}
			//鼠标移动
			function onDocumentMouseMove( event ) {

				mouseX = event.clientX - windowHalfX;

				targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

			}
			//鼠标弹起
			function onDocumentMouseUp( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}
			//鼠标离开
			function onDocumentMouseOut( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}
			//屏幕触摸开始
			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
					targetRotationOnMouseDown = targetRotation;

				}

			}
			//触摸开始移动
			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

				}

			}

			//动画
		
			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}
			//渲染
			function render() {

				group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

				camera.lookAt( cameraTarget );

				renderer.clear();

				if ( postprocessing.enabled ) {

					composer.render( 0.05 );

				} else {

					renderer.render( scene, camera );

				}

			}

		</script>