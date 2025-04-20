<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Login extends Model {
    use HasFactory;

    protected $fillable = ['karyawan_id', 'waktu_login'];

    public function karyawan() {
        return $this->belongsTo(Karyawan::class);
    }
}

