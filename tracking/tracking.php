<?php

if (isset($_POST['p']) && $_POST['p'] == 'EW5dn45p') {

	// Get install count
	$count = file_get_contents("installs.txt");
	$count++;
	
	// Write new install count
	$fl = fopen("installs.txt", "w+");
	fwrite($fl, $count);
	fclose($fl);
	
	// Return install id
	if (is_int($count)) echo $count;

}

?>