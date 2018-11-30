
//Conecção com o firebase
const config = {
    apiKey: "AIzaSyCRJnI_QGAQTxpEnrvV-aA5YQPdS6-vaG8",
    authDomain: "aqui-tem-esporte.firebaseapp.com",
    databaseURL: "https://aqui-tem-esporte.firebaseio.com",
    projectId: "aqui-tem-esporte",
    storageBucket: "aqui-tem-esporte.appspot.com",
    messagingSenderId: "618796704244"
  };
firebase.initializeApp(config);

const db = firebase.database(); //buscando informações do database.
const ref = db.ref('pracas'); //pegando a referencia do database.

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map; //Variavel de geração do mapa.
var marker; //Variavel de gereção dos marcadores.
var userLocarionMarker; //variavel onde vai ser guardada a informacao do geolocalizacao do usuario
var markerOrg;
var markerEnd;

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

let calcelRoute = document.querySelector("#cancelarRota").onclick = () => { setTimeout("document.location.reload(true);") };
let calcelSearch = document.querySelector("#cancelarBusca").onclick = () => { setTimeout("document.location.reload(true);") }

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
			markerMap(cordenadas);

			let cordPracasDirection = new google.maps.LatLng(latM,lngM);//metodo para coleta das cordenadas das pracas para a funcaode rotas
			let name = praca.propriedades.nome; //busca o nome de todas as pracas
			let sports = praca.esportes;  //busca os esportes de todas as pracas
			let img = praca.propriedades.img; //busca as imagens de todas a pracas

			

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

			document.querySelector("#btnRota").onclick = function(){
				clearMarkersDirections();
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
					let cordOrg = route.start_location;
					let cordEnd = route.end_location;


					if(status == 'OK'){ //consicao de erro da rota

						markerDirectionOrigin(cordOrg);
						markerDirectionEnd(cordEnd);
						clearMarkers();
						clearMarkersSearch();
						directionsDisplay.setDirections(result); //criacao da rota

						document.querySelector("#card-desc-loc").style.display = "none"; //condicao para quando a rota for feita, o card que estiver aberto, fechará automaticamente
						document.querySelector("#cancelarBusca").style.display = "none";
						document.querySelector("#cancelarRota").style.display = "block";
					}

				});
			}
//fim====================================================================================

		});

			
		}
				
	})
	

	
	return filtroPracas;
	
}

//craia os marcadores de origem e fim da rota
var markersDirections = [];
function markerDirectionOrigin(positionOrg){
	markerOrg = new google.maps.Marker({
		position: positionOrg,
		map: map,
		icon: 'imgs/loc-pequena.png'
	});
	markersDirections.push(markerOrg);
}
function markerDirectionEnd(positionEnd){
	markerEnd = new google.maps.Marker({
		position: positionEnd,
		map: map,
		icon: 'imgs/marker-pequeno_larang.png'
	});
	markersDirections.push(markerEnd);
}

//agrupa os marcadores de direçao
function agruparMarkersDirectins(map) {
	for (var i = 0; i < markersDirections.length; i++) {
		markersDirections[i].setMap(map);
	}
}

//apaga os marcadores e a linha de direção
function clearMarkersDirections() {
	agruparMarkersDirectins(null);
	directionsDisplay.setMap(null);
}

//criacao de um marker que será ultilizado na Geolocalizacao do usuario
var ArrayPositionUser = [];
function userLocationMarker(positionUser){
	 userLocarionMarker = new google.maps.Marker({ //criacao de um novo marcador
		position: positionUser,
		map: map,
		icon: 'imgs/loc-pequena.png'
	 });
	ArrayPositionUser.push(userLocarionMarker)
}

//agrupamento do marcador da localizacao do usuario
function agruparMarkersLocUser(map) {
	for (var i = 0; i < ArrayPositionUser.length; i++) {
		ArrayPositionUser[i].setMap(map);
	}
}

//apagar marcadores da localizaçao do usuario
function clearMarkersUserLoc() {
	agruparMarkersLocUser(null);
}

//criaçao dos marcadores do mapa onde localiza-se as praças
var markers = [];
function markerMap(locPracas){
		marker = new google.maps.Marker({ //criaçao dos marcadores de todas as pracas
				position: locPracas, //pegas as cordenadas
				map: map, //indica em qual lugar imprimi os marcadores
				icon: 'imgs/marker-grande.png',//aplicacao do icone personalizado do marcador
				title: name //quando passa o mouse em cima do marcador ele mostra o nome do local sem precisar clicar
			});
		markers.push(marker);

}

//agrupamento dos marcadores do mapa onde localiza-se as praças
function agruparMarkers(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

//apagar markers
function clearMarkers() {
	agruparMarkers(null);
}


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

//aciona o filtro de praças
		document.querySelector("#list-esportes").onclick = (e) =>{
			let resultClick = e.target.id;
			filtroModalidade(snapshotPracas, resultClick);
			document.getElementById("card-categoria-esportes").style.display = "none";
		}

//criacao dos marcadores no mapa
		markerMap(cordPracas)

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
			
			document.querySelector("#btnRota").onclick = function(){
				clearMarkersDirections();
				

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
					let cordOrg = route.start_location;
					let cordEnd = route.end_location;


					if(status == 'OK'){ //consicao de erro da rota

						markerDirectionOrigin(cordOrg);
						markerDirectionEnd(cordEnd);
						clearMarkers();
						clearMarkersSearch();
						directionsDisplay.setDirections(result); //criacao da rota

						document.querySelector("#onoff").style.display = "none"; 
						document.querySelector("#cancelarBusca").style.display = "none";
						document.querySelector("#cancelarRota").style.display = "block";
					}
				});
			}
		});
	};
});

var searchMarker;
var searchMarkers = [];
//criação dos marcadores da pesquisa
function searchLocMarker(searchLoc){
	 searchMarker = new google.maps.Marker({
		position: searchLoc,
		map: map,
		icon:'imgs/marker-pequeno.png'
	 });
	 searchMarkers.push(searchMarker);
}

//agrupamento dos marcadores da pesquisa
function agruparMarkersSearch(map) {
	for (var i = 0; i < searchMarkers.length; i++) {
		searchMarkers[i].setMap(map);
	}
}

//apagar marcadores da pesquisa
function clearMarkersSearch() {
	agruparMarkersSearch(null);
}


const DouradosCenter = {lat: -22.223617,lng: -54.812193}; //constante onde contém a latitude e longitude do centro de dourados
google.maps.event.addDomListener(window, "load",function(){ // evento de busca de locais no mapa e funcao de inicializacao de mapa
	directionsDisplay = new google.maps.DirectionsRenderer();//atributo de direcao no mapa para a geracao das rotas
		map = new google.maps.Map(document.getElementById('map'), { //inicializacao do mapa
		center: DouradosCenter, //centralizacao do mapa, nesse caso o centro da cidade de Dourados-MS
		zoom: 14 //proximidade da visao do mapa
	});
	directionsDisplay.setMap(map); //licacao do direction com o mapa

//marcador para o AUTOCOMPLETE, a pesquisa de locais

//busca da Geolocalizacao e alertar na tela o exato ponto onde o usuario esteja posicionado
	let btnGPS = document.querySelector("#userLoc").onclick = function(){ //inicio, buscando o botao onde sera implementado a funcao
		clearMarkersUserLoc();
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(function(position){
				let userPositionLat = position.coords.latitude;
				let userPositionLng = position.coords.longitude;
				let userPoint = {lat: userPositionLat, lng: userPositionLng};
				map.setCenter(userPoint); //recentralizando o centro do mapa para a localizacao do usuario
				map.setZoom(16); //aumento do zoon para uma melhor vizualizacao
				userLocationMarker(userPoint);
			}, function(error){//caso der algum erro

				window.alert //alerta caso o localizador nao esteja ligado
				(`Ligue o Localizador para ver sua localização!!!
Recarregue a página`);
			});
		};
	};
//fim===================================================================================




//================================AUTOCOMPLETE======================================================
	var defaultBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(-22.223617, -54.812193));

	var options = {
		bounds: defaultBounds,
		types: ['establishment']
	};
	
	let inputTxt = document.querySelector("#autocomplete"); //busca o input text no arquivo HTML
	const search = new google.maps.places.Autocomplete(inputTxt, options); //constante onde liga as informacoes da api de busca do maps com o input do HTML
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

		searchLocMarker(place.geometry.location);
		document.querySelector("#cancelarBusca").style.display = "block";

	});
})


window.addEventListener('beforeinstallprompt', function(e) {
	// beforeinstallprompt Event fired
  
	// e.userChoice will return a Promise.
	// For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
	e.userChoice.then(function(choiceResult) {
  
	  console.log(choiceResult.outcome);
  
	  if(choiceResult.outcome == 'dismissed') {
		console.log('User cancelled home screen install');
	  }
	  else {
		console.log('User added to home screen');
	  }
	});
  });