
//Conecção com o firebase
const config = {
	apiKey: "AIzaSyDuKKc8ksB76mmvzVvoY8P4vsi7Wrn5Wko",
	authDomain: "ultimo-f7d1e.firebaseapp.com",
	databaseURL: "https://ultimo-f7d1e.firebaseio.com",
	projectId: "ultimo-f7d1e",
	storageBucket: "ultimo-f7d1e.appspot.com",
	messagingSenderId: "303544299270"
};
firebase.initializeApp(config);



const db = firebase.database(); //buscando informações do database.
const ref = db.ref('pracas'); //pegando a referencia do database.

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map; //Variavel de geração do mapa.
var marker; //Variavel de gereção dos marcadores.

//funcao que fecha o menu de opçoes da tela inicial
let splitMenu = document.querySelector("#initMenu").onclick= function(){
	let menu = document.getElementById("splitMenu").style.display;

	if (menu == "block") {
		document.getElementById("splitMenu").style.display = "none";
	}else{
		document.getElementById("splitMenu").style.display = "block";
	}
};

//funcao que que abre o menu de modalidades esportes
let btnSports = document.querySelector("#sports").onclick = function(){
	let listSport = document.getElementById("card-categoria-esportes").style.display;

	if (listSport == "none") {
		document.getElementById("card-categoria-esportes").style.display = "block";
	}else{
		document.getElementById("card-categoria-esportes").style.display = "none";
	}
}

//funcao que que fecha o menu de modalidades esportes
let btnSportsClose = document.querySelector("#btn-exit-card-esportes").onclick = function(){
	let listSport = document.getElementById("card-categoria-esportes").style.display;

	if (listSport == "block") {
		document.getElementById("card-categoria-esportes").style.display = "none";
		//  document.querySelector('#locations').disabled = false;
	}else{
		document.getElementById("card-categoria-esportes").style.display = "block";
		//  document.querySelector('#locations').disabled = true;
	}
}

var markersFilter = [];
function markerfilter(locations){
	var markerFilter = new google.maps.Marker({
		position: locations,
		map: map,
		icon: 'imgs/marker-pequeno_larang.png'
	});
	markersFilter.push(markerFilter);
}

function setMapOnAll(map) {
	for (var i = 0; i < markersFilter.length; i++) {
		markersFilter[i].setMap(map);
	}
}

function clearMarkers() {
	setMapOnAll(null);
}


//filtragem das modalidades
function filtroModalidade(snapshotPracas, modalidade){
	let pracaspesquisa = snapshotPracas.val().value; // o "val()" transforma os dados do database em valores.
	let filtroPracas = [];
	clearMarkers()
	pracaspesquisa.forEach(praca => {	
		let esportes = Object.keys(praca.esportes).map(key => praca.esportes[key]);
		
		let result = esportes.filter(function(el){
			return el.esporteNome === modalidade;
		});
		
		if (result.length > 0){
			filtroPracas.push(praca);	
			let latM = praca.cord.latlng[0]
			let lngM = praca.cord.latlng[1]
			let cordenadas = {lat: latM, lng: lngM};
			markerfilter(cordenadas);
			console.log(cordenadas);

			

			// console.log(marker);
		}
				
	})
	
	// console.log(filtroPracas)
	
	return filtroPracas;
	
}

var markers = [];
function markerMap(locPracas){
		marker = new google.maps.Marker({ //criaçao dos marcadores de todas as pracas
				position: locPracas, //pegas as cordenadas
				map: map, //indica em qual lugar imprimi os marcadores
				icon: 'imgs/marker-grande.png',//aplicacao do icone personalizado do marcador
				title: name //quando passa o mouse em cima do marcador ele mostra o nome do local sem precisar clicar
			});
		markers.push(marker);
		// console.log(markers)
}

console.log(markersFilter)

ref.on('value', function(snapshotPracas){ //|Referencía e liga(atribui) o data base a uma função,
										  //|onde tem-se um que imprime os valores do database.
  let pracas = snapshotPracas.val();

  for (let i = 0; i < pracas.value.length; i++) { //Loop que liga todos os dados do firebase
	    let cordLat = pracas.value[i].cord.latlng[0]; //busca todas as cordenadas de latitude de todas as pracas
	    let cordLng = pracas.value[i].cord.latlng[1]; //busca todas as cordenadas de longitude de todas as pracas
			let cordPracas = {lat: cordLat, lng: cordLng};//array com as cords de cada praca do database
			let cordPracasDirection = new google.maps.LatLng(cordLat,cordLng);//metodo para coleta das cordenadas das pracas para a funcaode rotas
			let name = pracas.value[i].propriedades.nome; //busca o nome de todas as pracas
			let sports = pracas.value[i].esportes;  //busca os esportes de todas as pracas
			let img = pracas.value[i].propriedades.img; //busca as imagens de todas a pracas
//=========================================================================================


//funcao onde fecha o card do local que o usuario escolheu
		let exit = document.querySelector("#exit").onclick = function(){
			let card = document.getElementById("onoff").style.display;

			if (card == "block") {
				document.getElementById("onoff").style.display = "none";
				document.querySelector("#desc-card").innerHTML = "";
			}else{
				document.getElementById("onoff").style.display = "block";
			}
		};
//fim======================================================================================

//markers, rotas, displays cards

//=========================================================================================
		document.querySelector("#list-esportes").onclick = (e) =>{
			let resultClick = e.target.id;
			// console.log(filtroModalidade(snapshotPracas, resultClick));
			filtroModalidade(snapshotPracas, resultClick);
		}


//criacao dos marcadores no mapa
		
markerMap(cordPracas)

//fim======================================================================================
		


//funcao de click e adiçao dos dados do data base no card selecionado
		marker.addListener("click", function(){ //funcao onde é adicionado o evento de click e a funcao onde gera um "card" com as informacoes da praca selecionada
			document.getElementById("onoff").style.display = "block"; //quando click for acionado o card fica com display block, ou seja, imprime na tela
			document.getElementById("title-card").innerHTML = name; //imprime o nome do local, no card
//fim======================================================================================

//aplicacao dos icones das modalidades esportivas nos card referente as pracas
			sports.filter(function(esporte) {//filtragem das imagens de cada modalidades esportiva para o card
				const linkSport = esporte.link;//caminho no banco de dados
				let ImgDesc = document.getElementById("desc-card");//buscando a posicao do card onde sera colocado as imagens de cada modadalidade
				let ImgCreated = document.createElement("img");//criacao do elemento IMG para que, com o FOR, crie todas imagens das modalidades esportidas de cada praca
				ImgCreated.setAttribute('class','icon_sports_card');
				ImgCreated.src = "" +linkSport+ "";//implementando o link da imagem no SRC do elemento IMG no card
				ImgDesc.appendChild(ImgCreated);//aplicando o elemento IMG no card

			})
//fim======================================================================================

			document.querySelector(".demo-card-wide > .mdl-card__title").style.background = "url('"+img+"') center / cover"; // imprime a imagem do local, no card

//=========================================================================================




//busca da localizacao do usuario para a rota
			let userPoint;//variavel para a aplicacao da geolocalizacao do usuario
				if ('geolocation' in navigator) {
					navigator.geolocation.getCurrentPosition(function(position){ //buscando confirmacao do usuario no navegador
						let userPositionLat = position.coords.latitude;//organizacao das coordenadas de latitude
						let userPositionLng = position.coords.longitude;//organizacao das coordenadas da longitude
						userPoint = new google.maps.LatLng(userPositionLat,userPositionLng);//aplicando na variavel userPoint

					});
				};
//fim======================================================================================

//botao de geracao da rota apartir do local do usuario até o destino
			var positionOrg = {lat: -22.205372,lng: -54.750768};
			var markerOrg = new google.maps.Marker({
				position: positionOrg,
				map: map,
				icon: 'imgs/loc-pequena.png'
			});
			markerOrg.setVisible(false);
			var positionEnd = {lat: -22.205372,lng: -54.750768};
			var markerEnd = new google.maps.Marker({
				position: positionEnd,
				map: map,
				icon: 'imgs/marker-pequeno_larang.png'
			});
			markerEnd.setVisible(false);

			document.querySelector("#btnRota").onclick = function(){
				directionsDisplay.setMap(null);
				console.log(markerEnd)
				console.log(markerOrg)

				const rendererOptions = {
					map: map,
					suppressMarkers: true
				};


				directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
				directionsDisplay.setMap(map);


				let confgRote = { //configuracoes da rota
					origin: userPoint, //ponto A da rota, a origem
					destination: cordPracasDirection, //ponto B da rota, o fim
					travelMode: 'DRIVING' //transporte utilizado
				};

				directionsService.route(confgRote, function(result,status){ //tratamento das rotas

					var route = result.routes[0].legs[0];
					positionOrg = route.start_location;
					positionEnd = route.end_location;


					if(status == 'OK'){ //consicao de erro da rota

						 
						 markerOrg.setPosition(positionOrg);
						 markerOrg.setVisible(true);

						 markerEnd.setPosition(positionEnd)
						 markerEnd.setVisible(true);



						directionsDisplay.setDirections(result); //criacao da rota

						document.querySelector("#onoff").style.display = "none"; //condicao para quando a rota for feita, o card que estiver aberto, fechará automaticamente
					}

				});
			}




//fim=====================================================================================


		});

		
		
		

	};

	
});








const DouradosCenter = {lat: -22.223617,lng: -54.812193}; //constante onde contém a latitude e longitude do centro de dourados
google.maps.event.addDomListener(window, "load",function(){ // evento de busca de locais no mapa e funcao de inicializacao de mapa
	directionsDisplay = new google.maps.DirectionsRenderer();//atributo de direcao no mapa para a geracao das rotas
		map = new google.maps.Map(document.getElementById('map'), { //inicializacao do mapa
		center: DouradosCenter, //centralizacao do mapa, nesse caso o centro da cidade de Dourados-MS
		zoom: 14 //proximidade da visao do mapa
	});
	directionsDisplay.setMap(map); //licacao do direction com o mapa

//fim====================================================================================

//marcador para o AUTOCOMPLETE, a pesquisa de locais
	let searchMarker;
	const brasilCenter = {lat: -14.235004,lng: -51.92528};
	 	searchMarker = new google.maps.Marker({
			position:brasilCenter,
			map: map
	});
	searchMarker.setVisible(false);

//fim=====================================================================================

//criacao de um marker que será ultilizado na Geolocalizacao do usuario
	let userLocarionMarker; //variavel onde vai ser guardada a informacao do geolocalizacao do usuario
	const brasilCenter1 = {lat: -14.235004,lng: -51.92528};//vetor com o centro de Dourados-MS
	 	userLocarionMarker = new google.maps.Marker({ //criacao de um novo marcador
			position: brasilCenter1,
			map: map,
			icon: 'imgs/loc-pequena.png'
	});
 	userLocarionMarker.setVisible(false);//esconder o marker para que quando for encontrado a localizacao do usuario, o valor será TRUE
//fim====================================================================================
	var contador_posicao_user = 0;
//busca da Geolocalizacao e alertar na tela o exato ponto onde o usuario esteja posicionado
	let btnGPS = document.querySelector("#userLoc").onclick = function(){ //inicio, buscando o botao onde sera implementado a funcao
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(function(position){
				contador_posicao_user++;
				let userPositionLat = position.coords.latitude;
				let userPositionLng = position.coords.longitude;
				let userPoint = {lat: userPositionLat, lng: userPositionLng};
				userLocarionMarker.setPosition(userPoint);
				map.setCenter(userPoint); //recentralizando o centro do mapa para a localizacao do usuario
				map.setZoom(16); //aumento do zoon para uma melhor vizualizacao
				userLocarionMarker.setVisible(true);//marker passa a ser visivel

			}, function(error){//caso der algum erro

				window.alert //alerta caso o localizador nao esteja ligado
				(`Ligue o Localizador para ver sua localização!!!
Recarregue a página`);
			});
		};
	};
//fim===================================================================================




//================================AUTOCOMPLETE======================================================
	let inputTxt = document.querySelector("#autocomplete"); //busca o input text no arquivo HTML
		const search = new google.maps.places.Autocomplete(inputTxt); //constante onde liga as informacoes da api de busca do maps com o input do HTML
		search.bindTo("bounds",map); //execucao

	search.addListener('place_changed', function(){


		let place = search.getPlace();

		if (!place.geometry.viewport) {
			window.alert("ERRO");
			return;
		}
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		}else{
			map.setCenter(place.geometry.location);
			map.setZoom(18);
		}

		searchMarker.setPosition(place.geometry.location);
		//searchMarker.setVisible(true);
	});
})
