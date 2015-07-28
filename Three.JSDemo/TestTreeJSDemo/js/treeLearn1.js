function init()
{
	//初始化渲染
	var renderer=new THREE.WebGLRenderer({canvas:document.getElementById('mainCanvas')});
	
	renderer.setClearColor(0x000000);//黑色
	
	
	//场景
	var scene=new THREE.Scene();
	
	//相机
	var camera=new THREE.OrthographicCamera(-1,3,1.5,-1.5,1,10);
	camera.position.set(4,-3,5);
	camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);
	
	//场景中添加一个Cube
	var cube=new THREE.Mesh(new THREE.BoxGeometry(1,2,3),
			new THREE.MeshPhongMaterial(
			{
				specular:0xff0000
			})
	);
	
	scene.add(cube);
	
	//渲染
	
	renderer.render(scene,camera);
	
	
};