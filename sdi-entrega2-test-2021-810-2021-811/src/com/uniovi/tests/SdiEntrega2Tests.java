package com.uniovi.tests;

//Paquetes Java
import java.util.List;
//Paquetes JUnit
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SdiEntrega2Tests {
	// paths Raul
	//static String PathFirefox65 = "/Applications/Firefox.app";
	//static String Geckdriver024 = "/Users/raul/Desktop/perlasenv/bin/geckodriver";

	// paths Isra
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "E:\\CUARTO\\Segundo Cuatri\\SDI\\Pr�ctica\\practica5\\PL-SDI-Sesion5-material\\geckodriver024win64.exe";

	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "http://localhost:8081/";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opción de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	 //PR01. Registro de Usuario con datos v�lidos.
	@Test
	public void PR01() {
		driver.navigate().to(URL + "api/test/eliminar");
		driver.navigate().to(URL + "api/test/datos/insertar");
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "emailDePruebas@email.com", "Israel", "Mendez Rodr�guez", "123456", "123456");
		PO_View.checkElement(driver, "text", "Identificaci�n de usuario");
	}

	// PR02. Registro de Usuario con datos inv�lidos (email, nombre y apellidos
	// vac�os).
	@Test
	public void PR02() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con nombre vac�o
		PO_RegisterView.fillForm(driver, "uo263845@uniovi.es", " ", "Mendez", "123456", "123456");
		// COmprobamos el error de Nombre vac�o.
		PO_View.checkElement(driver, "text", "Nombre demasiado corto");
		// Rellenamos el formulario con apellidos vac�o
		PO_RegisterView.fillForm(driver, "uo263845@uniovi.es", "Israel", " ", "123456", "123456");
		// COmprobamos el error de apellidos vac�o.
		PO_View.checkElement(driver, "text", "Apellidos demasiado cortos");
		// Rellenamos el formulario con email vac�o
		PO_RegisterView.fillForm(driver, " ", "Israel", "Mendez", "123456", "123456");
	}

	//PR03. Registro de Usuario con datos inv�lidos (repetici�n de contrase�a inv�lida).
	@Test
	public void PR03() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con nombre vac�o
		PO_RegisterView.fillForm(driver, "uo263845@uniovi.es", "Israel", "Mendez", "123456", "1234");
		// COmprobamos el error de Nombre vac�o.
		PO_View.checkElement(driver, "text", "Las contrase�as deben coincidir");
	}

	//PR04. Registro de Usuario con datos inv�lidos (email existente).
	@Test
	public void PR04() {
		// Vamos al formulario de registro
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario con nombre vac�o
		PO_RegisterView.fillForm(driver, "emailDePruebas@email.com", "Israel", "Mendez", "123456", "1234");
		// COmprobamos el error de Nombre vac�o.
		PO_View.checkElement(driver, "text", "Usuario ya existente");

	}

	// PR05. Inicio de sesi�n con datos v�lidos.
	@Test
	public void PR05() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta admin
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		// Comprobamos que entramos en la pagina
		PO_View.checkElement(driver, "text", "Mis productos en venta");
	}

	// PR06. Inicio de sesi�n con datos inv�lidos (email existente, pero contrase�a
	// incorrecta).
	@Test
	public void PR06() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta admin
		PO_LoginView.fillForm(driver, "test1@email.com", "epfjew");
		// Comprobamos que entramos en la pagina
		PO_View.checkElement(driver, "text", "Email o contrase�a inv�lidos");
	}

	// PR07. Inicio de sesi�n con datos inv�lidos (campo email o contrase�a vac�os).
	@Test
	public void PR07() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta admin
		PO_LoginView.fillForm(driver, "test1@email.com", " ");
		// Comprobamos que entramos en la pagina
		PO_View.checkElement(driver, "text", "Email o contrase�a inv�lidos");
	}

	// PR08. Inicio de sesi�n con datos inv�lidos (email no existente en la
	// aplicaci�n).
	@Test
	public void PR08() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta admin
		PO_LoginView.fillForm(driver, "emailinventado@inventado.com", "contrase�afalsa");
		// Comprobamos que entramos en la pagina
		PO_View.checkElement(driver, "text", "Email o contrase�a inv�lidos");
	}

	// PR09. Hacer click en la opci�n de salir de sesi�n y comprobar que se redirige
	// a la p�gina de
	// inicio de sesi�n (Login).
	@Test
	public void PR09() {
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta admin
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		// Comprobamos que entramos en la pagina
		PO_View.checkElement(driver, "text", "Mis productos en venta");
		// Nos desconectamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		// Vemos que estamos en la pagina de login
		SeleniumUtils.textoPresentePagina(driver, "Identificaci�n de usuario");
	}

	// PR10. Comprobar que el bot�n cerrar sesi�n no est� visible si el usuario no
	// est� autenticado.
	@Test
	public void PR10() {
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Cerrar sesi�n", PO_View.getTimeout());
		// Vamos al formulario de logueo.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario con la cuenta normal
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		// Vemos que ahora si aparece la opci�n de desconectarnos
		SeleniumUtils.textoPresentePagina(driver, "Cerrar sesi�n");
	}

	// PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los
	// que existen en el
	// sistema.
	@Test
	public void PR11() {
		// Vamos al formulario de registro.
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		// Rellenamos el formulario
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		// Accedemos a la lista de usuarios
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 9);
	}

	// PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar que la lista se
	// actualiza y dicho usuario desaparece.
	@Test
	public void PR12() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 9);
		List<WebElement> checks = driver.findElements(By.xpath("//input[@type='checkbox']"));
		checks.get(0).click();
		driver.findElement(By.id("buttonDelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() ==8);
	}

	// PR13. Ir a la lista de usuarios, borrar el �ltimo usuario de la lista, comprobar que la lista se
	// actualiza y dicho usuario desaparece.
	@Test
	public void PR13() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "emailParaEliminar@email.com", "Israel", "Mendez Rodr�guez", "123456", "123456");
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 9);
		List<WebElement> checks = driver.findElements(By.xpath("//input[@type='checkbox']"));
		checks.get(checks.size() - 1).click();
		driver.findElement(By.id("buttonDelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() ==8);
	}

	//PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se actualiza y dichos
	// usuarios desaparecen.
	@Test
	public void PR14() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());
		assertTrue(elementos.size() == 8);
		List<WebElement> checks = driver.findElements(By.xpath("//input[@type='checkbox']"));
		checks.get(0).click();
		checks.get(1).click();
		checks.get(2).click();
		driver.findElement(By.id("buttonDelete")).click();
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "free", "//*[@id=\"tableUsers\"]/tbody/tr",
				PO_View.getTimeout());

		assertTrue(elementos.size() ==5);
	}

	//PR15. Ir al formulario de alta de oferta, rellenarla con datos v�lidos y pulsar el bot�n Submit.
	//Comprobar que la oferta sale en el listado de ofertas de dicho usuario.
	@Test
	public void PR15() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, "Prueba", "prueba", 10);
		int total = 0;
		total = driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr")).size();
		total+= driver.findElements(By.xpath("//table[@id='createdOffersHighlited']/tbody/tr")).size();
		assertTrue(total==1);
	}

	//PR16. Ir al formulario de alta de oferta, rellenarla con datos inv�lidos (campo t�tulo vac�o y
	// precio en negativo) y pulsar el bot�n Submit. Comprobar que se muestra el mensaje de campo
	// obligatorio.
	@Test
	public void PR16() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, " ", "prueba", 10);
		PO_View.checkElement(driver, "text", "Nombre demasiado corto");
		PO_NewOfferView.fillForm(driver, "Prueba", "prueba", -3);
		PO_View.checkElement(driver, "text", "El precio no puede ser negativo ni cero");

	}

	// PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se
	// muestran todas las
	// que existen para este usuario.
	@Test
	public void PR17() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		int total = 0;
		total = driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr")).size();
		total += driver.findElements(By.xpath("//table[@id='createdOffersHighlited']/tbody/tr")).size();
		assertTrue(total == 1);
	}

	// PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista,
	// comprobar que la lista se
	// actualiza y que la oferta desaparece.
	@Test
	public void PR18() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, "Prueba1", "prueba", 10);
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, "Prueba2", "prueba", 10);
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, "Prueba3", "prueba", 10);
		List<WebElement> elements = driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr"));
		System.out.println(elements.size());
		assertTrue( elements.size()== 4);
		driver.findElements(By.linkText("Eliminar")).get(0).click();
		assertTrue(driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr")).size() == 3);
	}

	// PR19. Ir a la lista de ofertas, borrar la �ltima oferta de la lista, comprobar que la lista se actualiza
	// y que la oferta desaparece.
	@Test
	public void PR19() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		assertTrue(driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr")).size() == 3);
		driver.findElements(By.linkText("Eliminar")).get(driver.findElements(By.linkText("Eliminar")).size() - 1)
				.click();
		assertTrue(driver.findElements(By.xpath("//table[@id='createdOffers']/tbody/tr")).size() == 2);
	}

	// P20. Hacer una b�squeda con el campo vac�o y comprobar que se muestra la p�gina que
	// corresponde con el listado de las ofertas existentes en el sistema
	@Test
	public void PR20() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("");
		driver.findElement(By.id("busqueda")).click();
		int total = 0;
		total = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).size();
		driver.findElements(By.xpath("//a[contains(@class, 'page-link')]")).get(1).click();
		total += driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).size();
		assertTrue(total == 10);
	}

	// PR21. Hacer una b�squeda escribiendo en el campo un texto que no exista y comprobar que se
	// muestra la p�gina que corresponde, con la lista de ofertas vac�a.
	@Test
	public void PR21() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("xxxxx");
		driver.findElement(By.id("busqueda")).click();
		int total = 0;
		total = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).size();
		assertTrue(total == 0);
	}

	// PR22. Hacer una b�squeda escribiendo en el campo un texto en min�scula o may�scula y
	// comprobar que se muestra la p�gina que corresponde, con la lista de ofertas que contengan
	// dicho texto, independientemente que el t�tulo est� almacenado en min�sculas o may�scula.
	@Test
	public void PR22() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Jabulani");
		driver.findElement(By.id("busqueda")).click();
		int total = 0;
		total = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).size();
		assertTrue(total == 1);
	}

	// PR23. Sobre una b�squeda determinada (a elecci�n de desarrollador), comprar una oferta que
	// deja un saldo positivo en el contador del comprobador. Y comprobar que el contador se
	// actualiza correctamente en la vista del comprador.
	@Test
	public void PR23() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Funko Pop");
		driver.findElement(By.id("busqueda")).click();
		WebElement oferta = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).get(0);
		oferta.findElement(By.id("comprar/Funko Pop")).click();
		SeleniumUtils.textoPresentePagina(driver, "Saldo disponible: 88 �");
	}

	// PR24. Sobre una b�squeda determinada (a elecci�n de desarrollador), comprar una oferta que
	// deja un saldo 0 en el contador del comprobador. Y comprobar que el contador se actualiza
	// correctamente en la vista del comprador.
	@Test
	public void PR24() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Mochila");
		driver.findElement(By.id("busqueda")).click();
		WebElement oferta = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).get(0);
		oferta.findElement(By.id("comprar/Mochila")).click();
		SeleniumUtils.textoPresentePagina(driver, "Saldo disponible: 0 �");
	}

	// PR25. Sobre una b�squeda determinada (a elecci�n de desarrollador), intentar comprar una
	// oferta que est� por encima de saldo disponible del comprador. Y comprobar que se muestra el
	// mensaje de saldo no suficiente.
	@Test
	public void PR25() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mTienda")).click();;
		WebElement busqueda = driver.findElement(By.name("busqueda"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Jabulani");
		driver.findElement(By.id("busqueda")).click();
		WebElement oferta = driver.findElements(By.xpath("//table[@id='tableOffers']/tbody/tr")).get(0);
		oferta.findElement(By.id("comprar/Jabulani")).click();
		SeleniumUtils.textoPresentePagina(driver, "No posee suficiente saldo");

	}

	// PR26.Ir a la opci�n de ofertas compradas del usuario y mostrar la lista. Comprobar que
	// aparecen las ofertas que deben aparecer.
	@Test
	public void PR26() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElement(By.id("mCompras")).click();;
		assertTrue(driver.findElements(By.xpath("//table[@id='tablaCompras']/tbody/tr")).size() == 2);
	}

	// PR27. Al crear una oferta marcar dicha oferta como destacada y a continuaci�n comprobar: i)
	//	que aparece en el listado de ofertas destacadas para los usuarios y que el saldo del usuario se
	//	actualiza adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR27() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		// Rellenamos el formulario.
		PO_RegisterView.fillForm(driver, "emailDePruebas2@email.com", "Israel", "Mendez Rodr�guez", "123456", "123456");
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas2@email.com", "123456");
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillFormDestacadas(driver, "Prueba", "prueba", 10);
		int total = 0;
		total= driver.findElements(By.xpath("//table[@id='createdOffersHighlited']/tbody/tr")).size();
		assertTrue(total==1);
		SeleniumUtils.textoPresentePagina(driver, "Saldo disponible: 80 �");
	}

	// PR028. Sobre el listado de ofertas de un usuario con m�s de 20 euros de saldo, pinchar en el
	//	enlace Destacada y a continuaci�n comprobar: i) que aparece en el listado de ofertas destacadas
	//	para los usuarios y que el saldo del usuario se actualiza adecuadamente en la vista del ofertante (-
	//	20).
	@Test
	public void PR28() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas2@email.com", "123456");
		PO_HomeView.clickOption(driver, "/producto/agregar", "class", "btn btn-primary");
		PO_NewOfferView.fillForm(driver, "Prueba", "prueba", 10);
		assertTrue(driver.findElements(By.xpath("//table[@id='createdOffersHighlited']/tbody/tr")).size()==1);
		driver.findElements(By.linkText("Destacar")).get(0).click();
		assertTrue(driver.findElements(By.xpath("//table[@id='createdOffersHighlited']/tbody/tr")).size()==2);
		SeleniumUtils.textoPresentePagina(driver, "Saldo disponible: 60 �");
	}

	// PR029. Sobre el listado de ofertas de un usuario con menos de 20 euros de saldo, pinchar en el
	// enlace Destacada y a continuaci�n comprobar que se muestra el mensaje de saldo no suficiente.
	@Test
	public void PR29() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		driver.findElements(By.linkText("Destacar")).get(0).click();
		SeleniumUtils.textoPresentePagina(driver, "No posee suficiente saldo");
	}

	// PR030. Inicio de sesi�n con datos v�lidos.
	@Test
	public void PR30() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
	}

	// PR031. Inicio de sesi�n con datos inv�lidos (email existente, pero contrase�a
	// incorrecta).
	@Test
	public void PR31() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.textoPresentePagina(driver, "Error al introducir las credenciales");
	}

	// PR032. Inicio de sesi�n con datos inv�lidos (campo email o contrase�a
	// vac�os).
	@Test
	public void PR32() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "", "");
		SeleniumUtils.textoPresentePagina(driver, "Login o password vac�os");
	}

	// PR033. Mostrar el listado de ofertas disponibles y comprobar que se muestran
	// todas las que
	// existen, menos las del usuario identificado.
	@Test
	public void PR33() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.textoNoPresentePagina(driver, "prueba 2");
		List<WebElement> elements = PO_View.checkElement(driver, "free", "//tr[contains(@class, 'ofertasRow')]");
		assertTrue(elements.size() == 5);
	}

	// PR034. Sobre una b�squeda determinada de ofertas (a elecci�n de desarrollador), enviar un
	//	mensaje a una oferta concreta. Se abrir�a dicha conversaci�n por primera vez. Comprobar que el
	//	mensaje aparece en el listado de mensajes.
	@Test
	public void PR34() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chatear")).get(0).click();
		WebElement busqueda = driver.findElement(By.id("textomensaje"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Esto es una prueba");
		driver.findElement(By.id("enviarMensaje")).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		SeleniumUtils.textoPresentePagina(driver, "Esto es una prueba");

	}

	// PR035. Sobre el listado de conversaciones enviar un mensaje a una conversaci�n ya abierta.
	// Comprobar que el mensaje aparece en el listado de mensajes.
	@Test
	public void PR35() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chatear")).get(0).click();
		WebElement busqueda = driver.findElement(By.id("textomensaje"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Segundo mensaje");
		driver.findElement(By.id("enviarMensaje")).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		SeleniumUtils.textoPresentePagina(driver, "Esto es una prueba");
		SeleniumUtils.textoPresentePagina(driver, "Segundo mensaje");
	}

	// PR036. Mostrar el listado de conversaciones ya abiertas. Comprobar que el
	// listado contiene las
	// conversaciones que deben ser.
	@Test
	public void PR36() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chatear")).get(2).click();
		WebElement busqueda = driver.findElement(By.id("textomensaje"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Esto es una prueba");
		driver.findElement(By.id("enviarMensaje")).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		driver.findElement(By.id("conver")).click();
		SeleniumUtils.esperarSegundos(driver, 1);
		List<WebElement> elements = PO_View.checkElement(driver, "free", "//tr[contains(@class, 'interesadosTabla')]");
		assertTrue(elements.size() == 2);
	}

	// PR037. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace
	// Eliminar de la primera y
	// comprobar que el listado se actualiza correctamente.
	@Test
	public void PR37() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chatear")).get(3).click();
		WebElement busqueda = driver.findElement(By.id("textomensaje"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Esto es una prueba");
		driver.findElement(By.id("enviarMensaje")).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		driver.findElement(By.id("conver")).click();
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Eliminar chat")).get(0).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		List<WebElement> elements = PO_View.checkElement(driver, "free", "//tr[contains(@class, 'interesadosTabla')]");
		System.out.println(elements.size());
		assertTrue(elements.size() == 2);

	}

	// PR038. Sobre el listado de conversaciones ya abiertas. Pinchar el enlace
	// Eliminar de la �ltima y
	// comprobar que el listado se actualiza correctamente.
	@Test
	public void PR38() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElement(By.id("conver")).click();
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Eliminar chat")).get(driver.findElements(By.linkText("Eliminar chat")).size() - 1)
		.click();
		SeleniumUtils.esperarSegundos(driver, 2);
		List<WebElement> elements = PO_View.checkElement(driver, "free", "//tr[contains(@class, 'interesadosTabla')]");
		System.out.println(elements.size());
		assertTrue(elements.size() == 1);

	}

	// PR039. Identificarse en la aplicaci�n y enviar un mensaje a una oferta, validar que el mensaje
	//	enviado aparece en el chat. Identificarse despu�s con el usuario propietario de la oferta y validar
	//	que tiene un mensaje sin leer, entrar en el chat y comprobar que el mensaje pasa a tener el estado
	//	le�do.
	@Test
	public void PR39() {
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chatear")).get(3).click();
		WebElement busqueda = driver.findElement(By.id("textomensaje"));
		busqueda.click();
		busqueda.clear();
		busqueda.sendKeys("Esto es una prueba");
		driver.findElement(By.id("enviarMensaje")).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		SeleniumUtils.textoPresentePagina(driver, "Esto es una prueba");
		List<WebElement> elementos = driver.findElements(By.className("mensaje_propio_no_leido"));
		assertTrue(elementos.size()==1);
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas2@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElement(By.id("conver")).click();
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chat")).get(0).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		driver.navigate().to("localhost:8081/cliente.html");
		PO_LoginView.fillForm(driver, "emailDePruebas@email.com", "123456");
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElement(By.id("conver")).click();
		SeleniumUtils.esperarSegundos(driver, 1);
		driver.findElements(By.linkText("Chat")).get(0).click();
		SeleniumUtils.esperarSegundos(driver, 2);
		elementos = driver.findElements(By.className("mensaje_propio_leido"));
		assertTrue(elementos.size()==1);
	}

}
