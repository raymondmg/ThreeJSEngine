<script>
		  <!--��⵱ǰ������Ƿ�֧��webgl-->
			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var container, stats, permalink, hex, color;

			var camera, cameraTarget, scene, renderer;

			var composer;
			var effectFXAA;

			var group, textMesh1, textMesh2, textGeo, material;

			var firstLetter = true;
		<!--��ʾ�������� �Լ���С�ߵ�����-->
			var text = "Test",

				height = 20,
				size = 70,
				hover = 30,

				curveSegments = 4,

				bevelThickness = 2,
				bevelSize = 1.5,
				bevelSegments = 3,
				bevelEnabled = true,

				font = "optimer", // ����ѡ��
				weight = "bold", // ����
				style = "normal"; // ��������ʽ

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

			<!--��ʼ��-->
			init();
			animate();

			
			<!--���ı���д��ƴ���ַ���-->
			function capitalize( txt ) {

				return txt.substring( 0, 1 ).toUpperCase() + txt.substring( 1 );

			}
			<!--TODO-->
			function decimalToHex( d ) {

				var hex = Number( d ).toString( 16 );
				hex = "000000".substr( 0, 6 - hex.length ) + hex;
				return hex.toUpperCase();

			}

			<!--��ʼ��-->
			function init() {

			//����һ��div��Ԫ�ظ�ֵΪ�������������ĵ�֮�н�����������-
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				permalink = document.getElementById( "permalink" );

				// ���     ��ǰΪ�������

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
				camera.position.set( 0, 400, 700 );

				cameraTarget = new THREE.Vector3( 0, 150, 0 );

				// ����

				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

				// �ƹ�

				var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
				dirLight.position.set( 0, 0, 1 ).normalize();
				scene.add( dirLight );

				var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
				pointLight.position.set( 0, 100, 90 );
				scene.add( pointLight );
				
				// ��ȡ #���ַ� ����Ϣ���Ե�ǰҳ���һЩЧ�������޸�

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

				//����
				material = new THREE.MeshFaceMaterial( [
					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // �������
					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // �����Ա߲���
				] );
				
				//
				group = new THREE.Group();
				group.position.y = 100;

				scene.add( group );
				
				//��������
				createText();
				
				
				//����ƽ��
				var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 10000, 10000 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
				);
				plane.position.y = 100;
				plane.rotation.x = - Math.PI / 2;
				scene.add( plane );

				// ��Ⱦ

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setClearColor( scene.fog.color );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
				container.appendChild( renderer.domElement );

				// ��ʾˢ��

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';

				// �¼�����

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'keypress', onDocumentKeyPress, false );
				document.addEventListener( 'keydown', onDocumentKeyDown, false );
				//����ı�Ч���ļ���
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


				// �ټӹ�

				renderer.autoClear = false;
				//��Ⱦͨ��
				var renderModel = new THREE.RenderPass( scene, camera );
				//����
				var effectBloom = new THREE.BloomPass( 0.25 );
				//��ӰЧ��
				var effectFilm = new THREE.FilmPass( 0.5, 0.125, 2048, false );
				//��ɫ��
				effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
				//��ȡ����Ŀ�͸�
				var width = window.innerWidth || 2;
				var height = window.innerHeight || 2;

				effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

				effectFilm.renderToScreen = true;

				composer = new THREE.EffectComposer( renderer );
				//�����ϼ����ٴδ����Ч�����
				composer.addPass( renderModel );
				composer.addPass( effectFXAA );
				composer.addPass( effectBloom );
				composer.addPass( effectFilm );

				//���ô����С

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
			//����#���������Ϣ
			function updatePermalink() {

				var link = hex + fontMap[ font ] + weightMap[ weight ] + boolToNum( postprocessing.enabled ) + boolToNum( bevelEnabled ) + "#" + encodeURI( text );

				permalink.href = "#" + link;
				window.location.hash = link;

			}
			//����������֮��
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
			//�����ͷ�
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
			//��������
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

				// �޸�����

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
				
				//����Ч��
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
			//ˢ����ʾ�ֵ�����
			function refreshText() {

				updatePermalink();

				group.remove( textMesh1 );
				if ( mirror ) group.remove( textMesh2 );

				if ( !text ) return;

				createText();

			}
			//��갴��
			function onDocumentMouseDown( event ) {

				event.preventDefault();

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mouseout', onDocumentMouseOut, false );

				mouseXOnMouseDown = event.clientX - windowHalfX;
				targetRotationOnMouseDown = targetRotation;

			}
			//����ƶ�
			function onDocumentMouseMove( event ) {

				mouseX = event.clientX - windowHalfX;

				targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

			}
			//��굯��
			function onDocumentMouseUp( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}
			//����뿪
			function onDocumentMouseOut( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}
			//��Ļ������ʼ
			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
					targetRotationOnMouseDown = targetRotation;

				}

			}
			//������ʼ�ƶ�
			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

				}

			}

			//����
		
			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}
			//��Ⱦ
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