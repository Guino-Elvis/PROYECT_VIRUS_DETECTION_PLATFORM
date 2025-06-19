<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vulnerabilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('scan_id');
            $table->foreign('scan_id')->references('id')->on('scans')->onDelete('cascade');
            $table->string('plugin_id');  // ID del plugin de ZAP
            $table->string('name');       // Nombre de la vulnerabilidad
            $table->enum('risk', ['Informational', 'Low', 'Medium', 'High', 'Critical']);
            $table->enum('confidence', ['Low', 'Medium', 'High', 'Confirmed']);
            $table->text('description')->nullable();
            $table->string('url')->nullable();      // URL afectada
            $table->string('parameter')->nullable(); // Parámetro afectado
            $table->text('solution')->nullable();   // Recomendación
            $table->text('evidence')->nullable();   // Pruebas o trazas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vulnerabilities');
    }
};
