function init()
{
	//��ʼ����Ⱦ
	var renderer=new THREE.WebGLRenderer({canvas:document.getElementById('mainCanvas')});
	
	renderer.setClearColor(0x000000);//��ɫ
	
	
	//����
	var scene=new THREE.Scene();
	
	//���
	var camera=new THREE.OrthographicCamera(-1,3,1.5,-1.5,1,10);
	camera.position.set(4,-3,5);
	camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);
	
	//���������һ��Cube
	var cube=new THREE.Mesh(new THREE.BoxGeometry(1,2,3),
			new THREE.MeshPhongMaterial(
			{
				specular:0xff0000
			})
	);
	
	scene.add(cube);
	
	//��Ⱦ
	
	renderer.render(scene,camera);
	
	
};