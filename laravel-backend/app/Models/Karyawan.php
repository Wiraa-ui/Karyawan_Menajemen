<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Karyawan extends Model {
    use HasFactory;

    protected $fillable = ['nama', 'username', 'password', 'unit_id', 'tanggal_bergabung'];

    protected $hidden = ['password'];

    public function unit() {
        return $this->belongsTo(Unit::class);
    }

    public function jabatans() {
        return $this->belongsToMany(Jabatan::class, 'jabatan_karyawan');
    }

    public function logins() {
        return $this->hasMany(Login::class);
    }
}
