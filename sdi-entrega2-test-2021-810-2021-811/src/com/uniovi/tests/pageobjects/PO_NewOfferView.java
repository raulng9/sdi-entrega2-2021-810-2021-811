package com.uniovi.tests.pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_NewOfferView {

	static public void fillForm(WebDriver driver, String titlep, String descriptionp, double pricep) {
		WebElement title = driver.findElement(By.name("nombre"));
		title.click();
		title.clear();
		title.sendKeys(titlep);
		WebElement description = driver.findElement(By.name("descripcion"));
		description.click();
		description.clear();
		description.sendKeys(descriptionp);
		WebElement price = driver.findElement(By.name("precio"));
		price.click();
		price.clear();
		price.sendKeys(String.valueOf(pricep));

		By boton = By.id("addProducts");
		driver.findElement(boton).click();
	}

	static public void fillFormDestacadas(WebDriver driver, String titlep, String descriptionp, double pricep) {
		WebElement title = driver.findElement(By.name("nombre"));
		title.click();
		title.clear();
		title.sendKeys(titlep);
		WebElement description = driver.findElement(By.name("descripcion"));
		description.click();
		description.clear();
		description.sendKeys(descriptionp);
		WebElement price = driver.findElement(By.name("precio"));
		price.click();
		price.clear();
		price.sendKeys(String.valueOf(pricep));
		WebElement check = driver.findElement(By.name("destacarProducto"));
		check.click();

		By boton = By.id("addProducts");
		driver.findElement(boton).click();
	}

}