package com.uniovi.sdi;

import static com.mongodb.client.model.Filters.eq;

import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.uniovi.sdi.pageobjects.*;
import com.uniovi.sdi.util.SeleniumUtils;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.util.List;

//Ordenamos las pruebas por la anotación @Order de cada método
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SdiEntrega2102ApplicationTests {

    static String Geckodriver = "geckodriver.exe";
    static String PathFirefox = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";

    static final String URL = "http://localhost:3000";
    static WebDriver driver = getDriver(PathFirefox, Geckodriver);

    private static MongoClient client;
    private static MongoDatabase database;
    private static MongoCollection<Document> doc;
    private static MongoCollection<Document> friendshiprequesets;
    private static MongoCollection<Document> postDocument;

    public static WebDriver getDriver(String PathFirefox, String Geckodriver) {
        System.setProperty("webdriver.firefox.bin", PathFirefox);
        System.setProperty("webdriver.gecko.driver", Geckodriver);
        driver = new FirefoxDriver();
        return driver;
    }

    //Antes de la primera prueba
    @BeforeAll
    static public void begin() {
        // mongodb setup
        try  {
            client = MongoClients.create("mongodb+srv://admin:admin@sdibook.1ld9m.mongodb.net/sdibook?retryWrites=true&w=majority");
            database = client.getDatabase("sdibook");
            doc = database.getCollection("users");
            friendshiprequesets = database.getCollection("friendshiprequests");
            postDocument = database.getCollection("posts");
        } catch (MongoException me) {
            throw me;
        }

    }

    //Al finalizar la última prueba
    @AfterAll
    static public void end() {
        //Cerramos el navegador al finalizar las pruebas
        Bson query = eq("name", "test");
        var res = doc.deleteMany(query);
        client.close();
        driver.quit();
    }

    //Antes de cada prueba se navega al URL home de la aplicación
    @BeforeEach
    public void setUp() {
        driver.navigate().to(URL);
        // cleanup
        Bson query = eq("name", "test");
        var res = doc.deleteMany(query);
    }

    //Después de cada prueba se borran las cookies del navegador
    @AfterEach
    public void tearDown() {
        driver.manage().deleteAllCookies();
    }

    @Test
    @Order(1)
    // registro de usuario con datos validos
    public void PR01() {
        PO_SignUpView.signUpAs(driver, "test01@email.com", "test01", "test", "test");
    }

    @Test
    @Order(2)
    // registro de usuario con datos invalidos
    public void PR02() {
        PO_SignUpView.signUpErrorAs(driver, "", "test01", "test", "test");
        PO_SignUpView.signUpErrorAs(driver, "test01@email.com", "test01", "", "test");
        PO_SignUpView.signUpErrorAs(driver, "test01@email.com", "test01", "test", "");
    }

    @Test
    @Order(3)
    // registro de usuario con datos invalidos, contraseña mal repetida
    public void PR03() {
        PO_SignUpView.signUpErrorAs(driver, "test01@email.com", "test01", "test02", "test", "test");
    }

    @Test
    @Order(4)
    // registro de usuario con datos invalidos, contraseña mal repetida
    public void PR04() {
        PO_SignUpView.signUpAs(driver, "test01@email.com", "test01", "test", "test");
        PO_SignUpView.signUpErrorAs(driver, "test01@email.com", "test01", "test", "test");
    }

    @Test
    @Order(5)
    // login como admin
    public void PR05() {
        PO_LoginView.loginAsAdmin(driver);
    }

    @Test
    @Order(6)
    // login como usuario normal
    public void PR06() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");
    }

    @Test
    @Order(7)
    // error login, campos vacíos
    public void PR07() {
        PO_LoginView.loginErrorAs(driver, "", "user01");
        PO_LoginView.loginErrorAs(driver, "user01@email.com", "");
    }

    @Test
    @Order(8)
    // error login, contraseña incorrecta
    public void PR08() {
        PO_LoginView.loginErrorAs(driver, "", "user01");
        PO_LoginView.loginErrorAs(driver, "user01@email.com", "asdad");
    }

    @Test
    @Order(9)
    // desconectarse
    public void PR09() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");
        PO_NavView.logout(driver);
    }

    @Test
    @Order(11)
    // listado de usuarios, mostrar todos los que existen
    public void PR11() {
        PO_LoginView.loginAs(driver, "admin@email.com", "admin");
        // Pinchamos en la opcion de gestión de usuarios
        List<WebElement> elements = PO_View.checkElementBy(driver, "free",
                "//*[@id=\"adminUsers-menu\"]");
        elements.get(0).click();
        // Esperamos a que aparezca la opción de ver usuarios
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"adminUsers-menu\"]/div/a");
        elements.get(0).click();

        long users = doc.countDocuments();

        //Contamos el número de filas de usuarios
        List<WebElement> usersList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());

        Assertions.assertEquals(users, usersList.size());

        PO_NavView.logout(driver);
    }

    @Test
    @Order(10)
    // no sale botón de desconexión cuando no estás autenticado
    public void PR10() {
        Assertions.assertThrows(TimeoutException.class, () -> PO_NavView.logout(driver));
    }

    @Test
    @Order(12)
    // Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar que la lista se actualiza
    // y dicho usuario desaparece.
    public void PR12(){
        PO_LoginView.loginAs(driver, "admin@email.com", "admin");
        // Recuperamos el usuario para volver a meterlo una vez lo borremos
        Document user1 = doc.find(eq("email", "user01@email.com")).first();
        // Usuarios antes de eliminar
        List<WebElement> usersList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        // Marcamos el checkbox del primer usuario (sería el segundo porque el primero es el admin)
        List<WebElement> elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[2]/td[4]/input");
        elements.get(0).click();

        // Le damos al botón de eliminar
        elements = PO_View.checkElementBy(driver, "free", "//*[@id='deleteButton']");
        elements.get(0).click();

        // Usuarios despues de eliminar
        List<WebElement> usersListAfter = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());

        // Debería haber un usuario menos
        Assertions.assertEquals(usersList.size() - 1, usersListAfter.size());
        //Logout
        PO_HomeView.logout(driver);
        // Volvemos a insertar el usuario
        doc.insertOne(user1);
    }

    @Test
    @Order(13)
    // Ir a la lista de usuarios, borrar el último usuario de la lista, comprobar que la lista se actualiza
    // y dicho usuario desaparece
    public void PR13(){
        PO_LoginView.loginAs(driver, "admin@email.com", "admin");

        // Usuarios antes de eliminar
        List<WebElement> usersList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        // Obtenemos el email del último usuario de la lista
        String[] fila = usersList.get(usersList.size() - 1).getText().split(" ");
        // Recuperamos el usuario en la última posición para volver a meterlo una vez lo borremos
        Document user1 = doc.find(eq("email", fila[0])).first();
        // Marcamos el checkbox del primer usuario (sería el segundo porque el primero es el admin)
        List<WebElement> elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[" + usersList.size() + "]/td[4]/input");
        elements.get(0).click();

        // Le damos al botón de eliminar
        elements = PO_View.checkElementBy(driver, "free", "//*[@id='deleteButton']");
        elements.get(0).click();

        // Usuarios despues de eliminar
        List<WebElement> usersListAfter = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());

        // Debería haber un usuario menos
        Assertions.assertEquals(usersList.size() - 1, usersListAfter.size());
        //Logout
        PO_HomeView.logout(driver);
        // Volvemos a insertar el usuario
        doc.insertOne(user1);
    }

    @Test
    @Order(14)
    // Ir a la lista de usuarios, borrar tres usuarios de la lista, comprobar que la lista se actualiza
    // y dichos usuarios desaparecen
    public void PR14(){
        PO_LoginView.loginAs(driver, "admin@email.com", "admin");

        // Usuarios antes de eliminar
        List<WebElement> usersList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        // Obtenemos el email del último usuario de la lista
        String[] fila1 = usersList.get(usersList.size() - 1).getText().split(" ");
        String[] fila2 = usersList.get(usersList.size() - 2).getText().split(" ");
        String[] fila3 = usersList.get(usersList.size() - 3).getText().split(" ");
        // Recuperamos los usuarios para luego meterlos
        Document user1 = doc.find(eq("email", fila1[0])).first();
        Document user2 = doc.find(eq("email", fila2[0])).first();
        Document user3 = doc.find(eq("email", fila3[0])).first();
        // Marcamos las checkboxes del primer usuario (sería el segundo porque el primero es el admin)
        List<WebElement> elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[" + usersList.size() + "]/td[4]/input");
        elements.get(0).click();
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[" + (usersList.size() - 1) + "]/td[4]/input");
        elements.get(0).click();
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[" + (usersList.size() - 2) + "]/td[4]/input");
        elements.get(0).click();

        // Le damos al botón de eliminar
        elements = PO_View.checkElementBy(driver, "free", "//*[@id='deleteButton']");
        elements.get(0).click();

        // Usuarios despues de eliminar
        List<WebElement> usersListAfter = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());

        // Volvemos a insertar los usuarios
        doc.insertOne(user1);
        doc.insertOne(user2);
        doc.insertOne(user3);

        // Debería haber tres usuarios menos
        Assertions.assertEquals(usersList.size() - 3, usersListAfter.size());
        //Logout
        PO_HomeView.logout(driver);

    }

    @Test
    @Order(16)
    // buscar con campo vacío y mostrar todos los usuarios
    public void PR16() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Pinchamos en la opcion de listar usuarios
        List<WebElement> elements = PO_View.checkElementBy(driver, "free",
                "/html/body/nav/div/div[2]/ul[1]/li[1]/a");
        elements.get(0).click();
        // Buscamos el boton de buscar y clickamos
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"searchButton\"]");
        elements.get(0).click();
        //Contamos el número de filas de usuarios
        List<WebElement> searchList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        // Pasamos de página
        PO_View.checkElementBy(driver, "free", "/html/body/div/div[2]/ul/li[2]/a").get(0).click();
        searchList.addAll(SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout()));

        //Cogemos la lista con todos los usuarios
        long users = doc.countDocuments();

        Assertions.assertEquals(users - 2, searchList.size());

        PO_NavView.logout(driver);
    }

    @Test
    @Order(17)
    // buscar con campo que no exista
    public void PR17() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Pinchamos en la opcion de listar usuarios
        List<WebElement> elements = PO_View.checkElementBy(driver, "free",
                "/html/body/nav/div/div[2]/ul[1]/li[1]/a");
        elements.get(0).click();
        WebElement searchText = driver.findElement(By.name("search"));
        searchText.click();
        searchText.clear();
        searchText.sendKeys("usuarionoexistente");
        // Buscamos el boton de buscar y clickamos
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"searchButton\"]");
        elements.get(0).click();
        // Comprobamos que la tabla no tiene ningún elemento
        SeleniumUtils.elementIsNotPresentOnPage(driver, "//tbody/tr");

        PO_NavView.logout(driver);
    }

    @Test
    @Order(18)
    // buscar con campo que exista
    public void PR18() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Pinchamos en la opcion de listar usuarios
        List<WebElement> elements = PO_View.checkElementBy(driver, "free",
                "/html/body/nav/div/div[2]/ul[1]/li[1]/a");
        elements.get(0).click();
        WebElement searchText = driver.findElement(By.name("search"));
        searchText.click();
        searchText.clear();
        searchText.sendKeys("al");
        // Buscamos el boton de buscar y clickamos
        elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"searchButton\"]");
        elements.get(0).click();
        //Contamos el número de filas de usuarios
        List<WebElement> searchList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        Assertions.assertEquals(4, searchList.size());

        PO_NavView.logout(driver);
    }



    @Test
    @Order(21)
    // Mostrar el listado de invitaciones de amistad recibidas. Comprobar con un listado que contenga varios.
    // Comprobar con un listado que contenga varias invitaciones recibidas.
    public void Prueba21() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Pinchamos en la opcion de solicitudes
        List<WebElement>  elements = PO_View.checkElementBy(driver, "free", "//*[@id=\"myrequests\"]/a");
        elements.get(0).click();
        List<WebElement> requestList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());

        Assertions.assertEquals(2, requestList.size());
        PO_HomeView.logout(driver);

    }

    @Test
    @Order(27)
    // Mostrar el listado de publicaciones de un usuario amigo y comprobar que se muestran todas las que existen para
    // dicho usuario
    public void Prueba27() throws InterruptedException {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Pinchamos en la opcion de amigos
        List<WebElement> elements = SeleniumUtils.waitLoadElementsBy(driver, "free", "//*[@id=\"myfriends\"]/a",
                PO_View.getTimeout());
        elements.get(0).click();

        // Obtenemos las filas para coger el nombre del usuario al que vamos a ver sus publicaciones
        List<WebElement> usersList = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        // Obtenemos el usuario, para luego comparar las filas de publicaciones que salen con las que tenga asociadas
        // el usuario
        Document friend = doc.find(eq("email", usersList.get(0).getText().split(" ")[0])).first();
        System.out.println(friend);
        // Pinchamos en el nombre del usuario
        elements = SeleniumUtils.waitLoadElementsBy(driver, "free", "//*[@id=\"cuerpo\"]/tr[1]/td[1]/a",
                PO_View.getTimeout());
        elements.get(0).click();
        // Vemos cuántas filas hay
        List<WebElement> posts = SeleniumUtils.waitLoadElementsBy(driver, "free", "//tbody/tr",
                PO_View.getTimeout());
        List<Object> userPosts = (List<Object>) friend.get("posts");
        Assertions.assertEquals(userPosts.size(), posts.size());
        PO_HomeView.logout(driver);

    }

    @Test
    @Order(28)
    // Utilizando un accesio vía URL u otra alternativa, tratar de listar las publicaciones de un usuario que no sea
    // amigo del usuario identificado en sesión. Comprobar que el sistema da un error de autorización.
    public void Prueba28() {
        PO_LoginView.loginAs(driver, "user01@email.com", "user01");

        // Probamos a entrar mediante url a las publicaciones de un usuario que no es amigo del usuario identificado.
        // En este caso el ID pasado no existe.
        driver.navigate().to("http://localhost:3000/posts/list/randomuser@email.com");

        // Comprobar que sale un error de autorización
        PO_View.checkError(driver);
    }

}
