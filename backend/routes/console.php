<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('investpro:accrue-profits')->everyMinute();
