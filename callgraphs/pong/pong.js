/*

	Dear Source-Code-Reader
	
	First of all, thank you for caring. Not that many 
	people view source. One of the beautiful things 
	about JavaScript is that it's necessarily Open-Source.
	I like that a lot. I hope you find this source code
	somewhat useful, and not too dirty. Remember to 
	pay it forward.

	Stewart Smith, Stewdio.
	December 2009.

*/




    ///////////////////
   //               //
  //   Break Out   //
 //               //
///////////////////


if( window.top != window.self )
{
	//console.log( window.top.location );
	window.top.location.replace( window.self.location );
};
//console.log( window.location );
/*if( window.self.location.host !== 'stewd.io' &&
	window.self.location.host !== 'translate.google.com' )//  lookout for Google translate
{
	parseURL = function(){ return 'http://stewd.io/pong' };
	window.location.href = 'ht' + 'tp' + ':' + '//stewd'+ '.io/' + 'pong';
};*/




    /////////////////
   //             //
  //   Globals   //
 //             //
/////////////////


//  Browser Windows

var base,
	ball,
	pla1,
	pla2,
	info,
	vict;


//  Window Boundaries

var unit = Math.round( screen.width / 16 );
var _top,
	_right,
	_bottom,
	_left;


//  Container Boundaries

var container = 
{
	top:    0,
	right:  screen.width,
	bottom: screen.height,
	left:   0
};


//  Window Movement

var x = 
{
	now:      0,
	target:   0,
	velocity: 0
};
var y = 
{
	now:      0,
	target:   0,
	velocity: 0
};


//  Game Stats

var paused        = false;
var player1_score = 0;
var player2_score = 0;
var highscore     = 0;
var robot         = false;




    ///////////////
   //           //
  //   Audio   //
 //           //
///////////////

var audio =
{
	enabled:    false,
	possible:   false,
	tags:       false,
	objects:    false,
	canPlayOgg: false,
	canPlayMp3: false,
	canPlayWav: false,
	canPlayMid: false,

	boot: function()
	{
		audio.tags = !!( document.createElement( "audio" ).canPlayType );
		try
		{
			audioTestObj  = new Audio( "" );
			audio.objects = !!( audioTestObj.canPlayType );
			if( audio.objects )
			{
				audio.canPlayMp3 = ( "no" != audioTestObj.canPlayType( "audio/mp3"  )) && ( "" != audioTestObj.canPlayType( "audio/mp3"  ));
				audio.canPlayMpg = ( "no" != audioTestObj.canPlayType( "audio/mpeg" )) && ( "" != audioTestObj.canPlayType( "audio/mpeg" ));
				audio.canPlayOgg = ( "no" != audioTestObj.canPlayType( "audio/ogg"  )) && ( "" != audioTestObj.canPlayType( "audio/ogg"  ));
				audio.canPlayWav = ( "no" != audioTestObj.canPlayType( "audio/wav"  )) && ( "" != audioTestObj.canPlayType( "audio/wav"  ));
				audio.canPlayMid = ( "no" != audioTestObj.canPlayType( "audio/midi" )) && ( "" != audioTestObj.canPlayType( "audio/midi" ));
				if( audio.canPlayMpg )  audio.canPlayMp3 = true;
				if( audio.canPlayMp3 || audio.canPlayOgg || audio.canPlayWav ) audio.possible = true;
			};
		}
		catch( e )
		{
			audio.objects = false;
		};
		if( audio.possible ) audio.enable();
		else audio.disable();
	},
	enable: function()
	{
		audio.enabled = true;
		$( ".buttons .b_sound" ).addClass( "active" );
		$( "#audio_status" ).html( "Sound is ON" );		
	},
	disable: function()
	{
		audio.enabled = false;
		audio.stop();
		$( ".buttons .b_sound" ).removeClass( "active selected hover" );
		$( "#audio_status" ).html( "Sound is OFF" );
	},
	toggle: function()
	{
		if( audio.possible )
		{
			if( audio.enabled ) audio.disable();
			else audio.enable();
		};
	},
	add: function( id )
	{
		if( audio.possible )
		{
			var src = "med/";
			if( audio.canPlayMp3 )      src += "mp3/" + id + ".mp3";
			else if( audio.canPlayOgg ) src += "ogg/" + id + ".ogg";
			else if( audio.canPlayWav ) src += "wav/" + id + ".wav";
			$( new Audio( src )).attr({
				"id" : id,
				"controls" : false,
				"loop" : false,
				"autobuffer" : true,
				"autoplay" : false
			}).appendTo( "#audio" );
			$( "audio#" + id ).trigger( "load" );
		};
	},
	play: function( id )
	{
		//  This was a life-saver:
		//  http://www.whatwg.org/specs/web-apps/current-work/#audio
		//  To view the Console enter this in URL bar: javascript:$("#console").toggle()
		//  Unfortunately Chrome and FireFox don't fully support media.currentTime
		
		if( audio.possible && audio.enabled )
		{

			//  Log the audio file's name

			$( "audio#"+ id ).trigger( "pause" );
			$( "#console .pad" ).prepend( "<br />" );


			//  Log the intended startTime
			//  Currently returns "undefined" in FireFox

			var startTime = $( "audio#"+ id ).attr( "startTime" );
			$( "#console .pad" ).prepend( "StartTime: " + startTime +"<br />" );


			//  Attempt to reset the playhead to zero

			var currentTime = $( "audio#"+ id ).attr( "currentTime" );
			$( "#console .pad" ).prepend( "currentTime Original: " + currentTime +"<br />" );
			if( currentTime != 0 )
			{
				try
				{
					$( "audio#"+ id ).attr( "currentTime", 0 );
					currentTime = $( "audio#"+ id ).attr( "currentTime" );
					$( "#console .pad" ).prepend( "currentTime Reset?: " + currentTime +"<br />" );
				}
				catch( e )
				{
					$( "#console .pad" ).prepend( "Sorry, failed to reset timeline.<br />" );
				};
			};


			//  Ok, the playhead should be reset to zero but it doesn't work in Chrome or FireFox
			//  Chrome pretends the currentTime is set to zero, but it isn't
			//  and FireFox just gives up and refuses to assign values to currentTime

			$( "#console .pad" ).prepend( $( "audio#"+ id ).attr( "src" ) +"<br />" );			
			$( "audio#"+ id ).trigger( "play" );
		};
	},
	stop: function()
	{
		$( "audio" ).trigger( "pause" );
		$( "audio" ).attr( "currentTime", 0 );
	}
};




    //////////////////
   //              //
  //   Commands   //
 //              //
//////////////////


var play = function()
{
	base.paused = true;
	base.player1_score = 0;
	base.player2_score = 0;
	base.stopBlinking();

	var w  = unit;
	var h  = unit * 2;
	var px = Math.round( screen.width  / 2 - w / 2 );
	var py = Math.round( screen.height / 2 - h / 2 );
	if( !pla1 || pla1.closed ) pla1 = window.open( "player1.html", "Player1", "top="+ py +",left="+ px +",width="+ w +",height="+ h +",location=no,menubar=no,scrollbars=no,status=no,toolbar=no" );
	if( !pla2 || pla2.closed ) pla2 = window.open( "player2.html", "Player2", "top="+ py +",left="+ px +",width="+ w +",height="+ h +",location=no,menubar=no,scrollbars=no,status=no,toolbar=no" );

	var bx = Math.round( screen.width  / 2 - unit / 2 );
	var by = Math.round( screen.height / 2 - unit / 2 );
	if( !ball || ball.closed ) ball = window.open( "ball.html", "Ball", "top="+ by +",left="+ bx +",width="+ unit +",height="+ unit +",location=no,menubar=no,scrollbars=no,status=no,toolbar=no" );

	if( pla1 && !pla1.closed )
	{
		pla1.resizeTo( w, h );//  Chrome requires this to override its window.open() minimum size restrictions.
		pla1.focus();
	};
	if( pla2 && !pla2.closed )
	{
		pla2.resizeTo( w, h );//  Chrome requires this to override its window.open() minimum size restrictions.
		pla2.focus();
	};
	if( ball && !ball.closed )
	{
		ball.resizeTo( unit, unit );//  Chrome requires this to override its window.open() minimum size restrictions.
		ball.focus();
	};
	base.$( ".buttons .b_play" ).addClass( "active" );
	base.pause();
};


var is_intact = function()
{
	
	this.handle && !this.handle.closed && this.handle.document
	
	if( base && !base.closed &&
		ball && !ball.closed &&
		pla1 && !pla1.closed &&
		pla2 && !pla2.closed  )
	{
		return true;
	}
	else return false;
};


var pause = function()
{
	if( is_intact() )
	{
		if( base.paused )
		{
			base.paused = false;
			$( ".buttons .b_pause" ).removeClass( "active selected hover" );
			audio.stop();
			if( pla1.screenX == pla2.screenX ) audio.play( "game_start" );
			else audio.play( "game_resume" );
			if( pla1.$ ) pla1.$( "#paddle_score" ).css( "opacity", 1.0 );
			if( pla2.$ ) pla2.$( "#paddle_score" ).css( "opacity", 1.0 );
			pla1.focus();
			pla2.focus();
			ball.focus();
		}
		else
		{
			base.paused = true;
			$( ".buttons .b_pause" ).addClass( "active" );
			audio.play( "game_pause" );
			if( pla1.$ ) pla1.$( "#paddle_score" ).css( "opacity", 0.3 );
			if( pla2.$ ) pla2.$( "#paddle_score" ).css( "opacity", 0.3 );			
		};
	};
};


var reset = function()
{
	if( x.velocity == 0 )
	{
		x.velocity = Math.round( Math.random() * 20 ) + 20;
		if( Math.round( Math.random( 0, 1 )) ) x.velocity *= -1;
	}
	else
	{
		var temp = x.velocity;
		x.velocity = Math.round( Math.random() * 20 ) + 20;
		if( temp < 0 ) x.velocity *= -1;
	};
	y.velocity = Math.round( Math.random() * 20 ) + 15;
	y.velocity = Math.abs( y.velocity ) * -1;
	y.now -= unit;
};


var quit = function()
{
	if( ball && !ball.closed ) ball.close();
	if( pla1 && !pla1.closed ) pla1.close();
	if( pla2 && !pla2.closed ) pla2.close();
	base.$( ".buttons .b_pause" ).removeClass( "active selected hover" );
	base.$( ".buttons .b_play" ).removeClass( "active selected hover" );
	base.startBlinking();
};


var score = function( score1, score2 )
{
	base.player1_score = score1;
	base.player2_score = score2;
	
	if( base.player1_score ) pla1.$( "#paddle_score" ).html( base.player1_score );
	if( base.player2_score ) pla2.$( "#paddle_score" ).html( base.player2_score );
		
	var score_min = Math.min( score1, score2 );
	var score_max = Math.max( score1, score2 );
	if( score_max > 10 && score_max - score_min > 1 ) base.game_over();
};


var game_over = function()
{
	var  player1wins = parseInt( $( "#player1wins p" ).html() );
	if( !player1wins ) player1wins = 0;
	var  player2wins = parseInt( $( "#player2wins p" ).html() );
	if( !player2wins ) player2wins = 0;
	
	var playerWon = 0;
	if( player1_score > player2_score )
	{	
		playerWon = 1;
		player1wins ++;
		$( "#player1wins p" ).html( player1wins );
	}
	else
	{
		playerWon = 2;
		player2wins ++;
		$( "#player2wins p" ).html( player2wins );
	};

	audio.stop();
	if(( playerWon == 1 && player1wins == 2 && player2wins < 2 ) || ( playerWon == 2 && player2wins == 2 && player1wins < 2 ))
	{
		audio.play( "song_mister_ping_pong" );
	}
	else if(( player1wins == 3 && player2wins == 0 ) || ( player2wins == 3 && player1wins == 0 ))
	{
		audio.play( "song_give_you_up" );
	}
	else audio.play( "game_victory" );
	victory( playerWon );
	quit();
};


var victory = function( i )
{
	var playerName = i == 1 ? "Red" : "Green";
	var w = 420;
	var h = 260;
	var x = Math.round( screen.width  / 2 - w / 2 );
	var y = Math.round( screen.height / 2 - h / 2 );
	if( !vict ||  vict.closed ) vict = window.open( "victory"+ i +".html", "Victory", "top="+ y +",left="+ x +",width="+ w +",height="+ h +",location=no,menubar=no,scrollbars=no,status=no,toolbar=no" );
	if(  vict && !vict.closed )
	{
		vict.resizeTo( w, h );//  Stupid Chrome browser
		vict.focus();
	}
	else alert( "VICTORY !\nCongratulations "+ playerName +".\n\nNow give each other a good elbow bump and don't forget to disinfect your keyboards. Tis swine flu season afterall.\n\n" );
};


var about = function()
{
	var w = 420;
	var h = 600;
	var x = Math.round( screen.width  / 2 - w / 2 );
	var y = Math.round( screen.height / 2 - h / 2 );
	if( !info ||  info.closed ) info = window.open( "about.html", "About", "top="+ y +",left="+ x +",width="+ w +",height="+ h +",location=no,menubar=no,scrollbars=yes,status=no,toolbar=no" );
	if(  info && !info.closed )
	{
		info.resizeTo( w, h );//  Stupid Chrome browser
		info.focus();
	};
	base.paused = false;
	base.pause();
};




    ///////////////////////
   //                   //
  //   Ball Movement   //
 //                   //
///////////////////////


var move = function()
{
	if( !base.paused )
	{

		//  Either next two lines fix a FireFox bug
		//  or they fix a dumb mistake of mine somewhere

		if( !pla1 || pla1.closed ) pla1 = base.pla1;
		if( !pla2 || pla2.closed ) pla2 = base.pla2;
		

		//  Top and Bottom
		
		if( _top <= container.top + 20 && y.velocity < 0 )
		{
			y.velocity *= -1;
		};
		if( _bottom >= container.bottom - 20 && y.velocity > 0 )
		{
			y.velocity *= -1;
		};


		//  Left and Right
	
		if( _left <= container.left && x.velocity < 0 )
		{
			x.now = container.right;
			if( !base.$( "#robot2" ).is( ":checked" ))
			{
				var temp = Math.floor( Math.random() * 10 );
				switch( temp )
				{
					case 0:
						audio.play( "robot_bring_it_on" );
						break;

					case 1:
						audio.play( "robot_come_on" );
						break;

					default:
						audio.play( "player_2_miss" );
				};
			}
			else audio.play( "player_2_miss" );
			base.score( base.player1_score, base.player2_score + 1 );
			reset();
		};
		if( _right >= container.right && x.velocity > 0 )
		{
			x.now = container.left;
			if( !base.$( "#robot1" ).is( ":checked" ))
			{
				var temp = Math.floor( Math.random() * 10 );
				switch( temp )
				{
					case 0:
						audio.play( "robot_bring_it_on" );
						break;

					case 1:
						audio.play( "robot_come_on" );
						break;

					default:
						audio.play( "player_1_miss" );
				};
			}
			else audio.play( "player_1_miss" );
			base.score( base.player1_score + 1, base.player2_score );
			reset();
		};
		
		
		//  Ball made contact with Player 1's Paddle?

		if( _top    <= pla1._bottom && 
			_bottom >= pla1._top    &&
			_left   <= pla1._right  &&
			_left   >  pla1._left   &&
			x.velocity < 0 )
		{
			var sinHit = ball.y.now - pla1.y.now;
			sinHit /= ball.outerHeight / 2 + pla1.outerHeight / 1;
			if( Math.abs( sinHit ) < 1 )
			{
				var ball_scalar = Math.sqrt( Math.pow( ball.x.velocity, 2 ) + Math.pow( ball.y.velocity, 2 ));
				if( sinHit < -0.3 || sinHit > 0.5 ) audio.play( "ball_return_skew" );
				else audio.play( "ball_return_normal" );

				if( base.player1_score > base.player2_score + 1 )  $( "body" ).css( "background-color", "#F00" );
				else if( base.player1_score > base.player2_score ) $( "body" ).css( "background-color", "#FB0" );
				else $( "body" ).css( "background-color", "#FF0" );

				ball.x.velocity = ball_scalar * Math.sqrt( 1 - Math.pow( sinHit, 2 ));
				ball.y.velocity = Math.abs( ball_scalar * sinHit );
				if( ball.y.now < pla1.y.now ) ball.y.velocity *= -1;
			};
		};


		//  Ball made contact with Player 2's Paddle?

		if( _top    <= pla2._bottom && 
			_bottom >= pla2._top    &&
			_right  <  pla2._right  &&
			_right  >= pla2._left   &&
			x.velocity > 0 )
		{
			var sinHit = ball.y.now - pla2.y.now;
			sinHit /= ball.outerHeight / 4 + pla2.outerHeight / 1;
			if( Math.abs( sinHit ) < 1 )
			{
				var ball_scalar = Math.sqrt( Math.pow( ball.x.velocity, 2 ) + Math.pow( ball.y.velocity, 2 ));
				if( sinHit < -0.3 || sinHit > 0.5 ) audio.play( "ball_return_skew" );
				else audio.play( "ball_return_normal" );

				if( base.player2_score > base.player1_score + 1 )  $( "body" ).css( "background-color", "#0C0" );
				else if( base.player2_score > base.player1_score ) $( "body" ).css( "background-color", "#9D0" );
				else $( "body" ).css( "background-color", "#FF0" );

				ball.x.velocity = ball_scalar * Math.sqrt( 1 - Math.pow( sinHit, 2 )) * -1;
				ball.y.velocity = Math.abs( ball_scalar * sinHit );
				if( ball.y.now < pla2.y.now ) ball.y.velocity *= -1;
			};
		};

	
		//  Advance the Ball
	
		x.velocity *= 1 + Math.random() * 0.004;
		x.now +=  Math.round( x.velocity );
		y.velocity *= 1 + Math.random() * 0.003;
		y.now +=  Math.round( y.velocity );

		window.moveTo( x.now, y.now );
		_top    = y.now;
		_right  = x.now + window.outerWidth;
		_bottom = y.now + window.outerHeight;
		_left   = x.now;
	};
};




    /////////////////////////
   //                     //
  //   Paddle Movement   //
 //                     //
/////////////////////////


var go_up = function()
{
	y.target -= unit * 3
};
var go_down = function()
{
	y.target += unit * 3
};

var ease = function()
{

	//  Either next three lines fix a FireFox bug
	//  or they fix a dumb mistake of mine somewhere

	if( !pla1 || pla1.closed ) pla1 = base.pla1;
	if( !pla2 || pla2.closed ) pla2 = base.pla2;
	if( !ball || ball.closed ) ball = base.ball;


	//  Robot Play

	if( window.name == "Player1" && !base.$( "#robot1" ).is( ":checked" ) && ball.x.velocity < 0 || 
		window.name == "Player2" && !base.$( "#robot2" ).is( ":checked" ) && ball.x.velocity > 0 )
	{
		if( Math.abs( y.now - y.target ) < window.outerHeight / 4 && !base.paused )
		{
			if( ball.y.now < y.now ) go_up();
			if( ball.y.now > y.now + window.outerHeight ) go_down();
		};
	};
	contain();
	x.now += ( x.target - x.now  ) / 5;
	x.now  = Math.round( x.now  );
	y.now += ( y.target - y.now ) / 5;
	y.now  = Math.round( y.now );

	window.moveTo( x.now, y.now );
	_top    = y.now;
	_right  = x.now + window.outerWidth;
	_bottom = y.now + window.outerHeight;
	_left   = x.now;
};

var contain = function()
{
	x.target = Math.max(   x.target, container.left );
	x.target = Math.min(   x.target, container.right - window.outerWidth );
	x.target = Math.round( x.target );

	y.target = Math.max(   y.target, container.top );
	y.target = Math.min(   y.target, container.bottom - window.outerHeight );
	y.target = Math.round( y.target );
};




    ////////////////////
   //                //
  //   Initialize   //
 //                //
////////////////////


var boot = function()
{
	if( window.name == "Player1" )
	{
		base  = window.opener;
		ball  = base.ball;
		pla1  = window;
		pla2  = base.pla2;
		audio = base.audio;

		container.left  = unit;
		container.right = container.left + window.outerWidth;
		x.target = window.screenX;
		x.now = x.target;
		y.target = screen.height / 2 - window.outerHeight / 2;
		y.now = y.target;
		window.setInterval( "ease()", 50 );
	}
	else if( window.name == "Player2" )
	{
		base  = window.opener;
		ball  = base.ball;
		pla1  = base.pla1;
		pla2  = window;
		audio = base.audio;

		container.right = screen.width - unit;
		container.left  = container.right - window.outerWidth;
		x.target = window.screenX;
		x.now = x.target;
		y.target = screen.height / 2 - window.outerHeight / 2;
		y.now = y.target;
		window.setInterval( "ease()", 50 );
	}
	else if( window.name == "Ball" )
	{
		base  = window.opener;
		ball  = window;
		pla1  = base.pla1;
		pla2  = base.pla2;
		audio = base.audio;
		
		x.now = Math.round( screen.width  / 2 - window.outerWidth  / 2 );
		y.now = Math.round( screen.height / 2 - window.outerHeight / 2 );
		window.reset();
		window.setInterval( "move()", 50 );
	}
	else
	{
		base = window;
		base.blinkValue  = 0.0;
		base.blinkVector = 0.1;
		base.blinker = function()//  Quick and dirty. Not my proudest moment.
		{
			base.blinkValue += base.blinkVector;
			if( base.blinkValue <  -0.2 )
			{
				base.blinkValue  = -0.2;
				base.blinkVector =  0.1;
			};
			if( base.blinkValue >   1.4 )
			{
				base.blinkValue  =  1.4;
				base.blinkVector = -0.1;
			};
			var constrained = base.blinkValue;
			if( constrained < 0 ) constrained = 0;
			if( constrained > 1 ) constrained = 1;			
			var red   = 0xEE - Math.round(( 0xEE - 0xBB ) * constrained );
			var green = red;
			var blue  = 0xEE + Math.round(( 0xFF - 0xEE ) * constrained );
			$( ".b_play" ).css( "background-color", "rgb("+ red +","+ green +","+ blue +")" );
			$( ".b_play" ).css( "color", "rgb(0,0,0)" );
		};
		base.blinkInterval = false;
		base.startBlinking = function()
		{
			if( base.blinkInterval ) clearInterval( base.blinkInterval );
			base.blinkInterval = setInterval( base.blinker, 50 );	
		};
		base.stopBlinking = function()
		{
			if( base.blinkInterval ) clearInterval( base.blinkInterval );
			$( ".b_play" ).css( "background-color", "rgb("+ 0xEE +","+ 0xEE +","+ 0xEE +")" );
		};
		base.startBlinking();
		audio.boot();
		
		
		//  Regular Game Sounds
		
		audio.add( "browser_pong_theme" );
		audio.add( "game_start"         );
		audio.add( "game_pause"         );
		audio.add( "game_resume"        );
		audio.add( "game_victory"       );
		audio.add( "ball_return_normal" );
		audio.add( "ball_return_skew"   );
		audio.add( "player_1_miss"      );
		audio.add( "player_2_miss"      );


		//  Zee Funnies
		
		audio.add( "robot_bring_it_on"     );
		audio.add( "robot_come_on"         );
		audio.add( "song_give_you_up"      );
		audio.add( "song_mister_ping_pong" );
		audio.add( "song_bouncy_chorus"    );
		audio.add( "laugh_short"           );
		audio.add( "laugh_normal"          );
		audio.add( "laugh_long"            );
		
		audio.play( "browser_pong_theme" );
	};


	//  Buttons

	$( ".buttons li:not(.exclude)" ).bind( "mouseenter", function()
	{
		$( this ).addClass( "hover" );
	})
	.bind( "mousedown", function()
	{
		$( this ).addClass( "selected" );
	})
	.bind( "mouseup", function()
	{
		$( this ).removeClass( "selected" );
	})
	.bind( "mouseleave", function()
	{
		$( this ).removeClass( "selected" );
		$( this ).removeClass( "hover" );
	});


	//  Footer Reveal

	$( "#footer" ).bind( "mouseenter", function()
	{
		$( this ).stop().animate({ opacity: 1.0 }, { queue: false, duration: 200 });
	})
	.bind( "mouseleave", function()
	{
		$( this ).animate({ opacity: 0.0 }, { queue: false, duration: 500 });
	});


	//  Keyboard Controls

	$( window ).keydown(
		function( e )
		{
			
			//  Wow. I had no idea JavaScript keyCodes differ from ASCII.
			//  They ignore case (both 'A' and 'a' will return 65)
			//  but differentiate between regular number and numeric keypad!	
			
			var key = e.keyCode || 0;
			if( key == 32 )//  Spacebar = pause
			{
				base.pause();
				base.$( ".buttons .b_pause" ).addClass( "selected" );
			};
			if( key == 48 || key == 96 )// 0 or 0-Keypad = no humans
			{
				base.$( "#robot1" ).attr( "checked", false );
				base.$( "#robot2" ).attr( "checked", false );
			};
			if( key == 49 || key == 97 )// 1 or 1-Keypad = only player 1 is human
			{
				base.$( "#robot1" ).attr( "checked", "checked" );
				base.$( "#robot2" ).attr( "checked", false );
			};
			if( key == 50 || key == 98 )// 2 or 2-Keypad = only player 2 is human
			{
				base.$( "#robot1" ).attr( "checked", false );
				base.$( "#robot2" ).attr( "checked", "checked" );
			};
			if( key == 51 || key == 99 )// 3 or 3-Keypad = both players are humans
			{
				base.$( "#robot1" ).attr( "checked", "checked" );
				base.$( "#robot2" ).attr( "checked", "checked" );
			};
			if( key == 80 )//  P or p = play (or resume)
			{
				base.play();
				base.$( ".buttons .b_play" ).addClass( "selected" );
			};
			if( key == 81 )//  Q or q = quit
			{
				base.quit();
				base.$( ".buttons .b_quit" ).addClass( "selected" );
			};
			if( key == 83 )//  S or s = sound toggle
			{
				audio.toggle();
				base.$( ".buttons .b_sound" ).addClass( "selected" );
			};
			if( key == 65 )//  A or a = player 1 up
			{
				if( pla1 && !pla1.closed && base.$( "#robot1" ).is( ":checked" ) ) pla1.go_up();
				base.$( ".buttons .b_player1up" ).addClass( "selected" );
			};
			if( key == 90 )//  Z or z = player 1 down
			{
				if( pla1 && !pla1.closed && base.$( "#robot1" ).is( ":checked" ) ) pla1.go_down();
				base.$( ".buttons .b_player1down" ).addClass( "selected" );
			};
			if( key == 38 )//  [UP ARROW] = player 2 up
			{
				if( pla2 && !pla2.closed && base.$( "#robot2" ).is( ":checked" ) ) pla2.go_up();
				base.$( ".buttons .b_player2up" ).addClass( "selected" );
			};
			if( key == 40 )//  [DOWN ARROW] = player 2 down
			{
				if( pla2 && !pla2.closed && base.$( "#robot2" ).is( ":checked" ) ) pla2.go_down();
				base.$( ".buttons .b_player2down" ).addClass( "selected" );
			};
		}
	);
	$( window ).keyup(
		function( e )
		{
			var key = e.keyCode || 0;
			if( key == 32 ) base.$( ".buttons .b_pause" ).removeClass( "selected" );
			if( key == 80 || key == 112 ) base.$( ".buttons .b_play" ).removeClass( "selected" );
			if( key == 81 || key == 113 ) base.$( ".buttons .b_quit" ).removeClass( "selected" );
			if( key == 83 || key == 115 ) base.$( ".buttons .b_sound" ).removeClass( "selected" );
			if( key == 65 || key ==  97 ) base.$( ".buttons .b_player1up" ).removeClass( "selected" );
			if( key == 90 || key == 122 ) base.$( ".buttons .b_player1down" ).removeClass( "selected" );
			if( key == 88 || key == 120 ) base.$( ".buttons .b_player1robot" ).removeClass( "selected" );
			if( key == 38 ) base.$( ".buttons .b_player2up" ).removeClass( "selected" );
			if( key == 40 ) base.$( ".buttons .b_player2down" ).removeClass( "selected" );
			if( key == 47 ) base.$( ".buttons .b_player2robot" ).removeClass( "selected" );
		}
	);
};








/*

Known Issues (OS X)

	Safari
[None. Safari is frakking awesome. Best browser ever.]

	Chrome
1. URL indicator visible.
2. Audio playhead gets stuck in random positions; unreliable playback!

	FireFox
1. URL bar and status bar visible.
2. Audio playhead gets stuck in random positions; unreliable playback!

	Opera
1. Audio not working due to lack of JavaScript support for it.
2. URL indicator visible.


Not tested for Windows or Linux.
The client is myself and myself doesn't care to test on Windows or Linux.

*/


function Stewdio() {};
$( window ).bind( "load", function(){ boot() });