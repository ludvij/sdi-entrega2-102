package com.uniovi.sdi;

import static com.mongodb.client.model.Filters.eq;

import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.uniovi.sdi.pageobjects.*;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.junit.jupiter.api.*;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import java.sql.Time;
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
    @Order(10)
    // no sale botón de desconexión cuando no estás autenticado
    public void PR10() {
        Assertions.assertThrows(TimeoutException.class, () -> PO_NavView.logout(driver));
    }

}
