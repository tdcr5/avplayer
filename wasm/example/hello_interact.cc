#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif

#include <stdio.h>
#include <malloc.h>
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
extern "C" int sub(int a, int b);

EM_PORT_API(int) console_log(int result);

int g_a = 4;
double g_b = 3.1415926;

EM_PORT_API(int) print() {
    printf("test export function \n");
    return 3;
}

EM_PORT_API(int) add(int a, int b) {

    return a+b;
}

EM_PORT_API(void) printSubResult(int a, int b) {

    int result = sub(a, b);
    console_log(result);
}


EM_PORT_API(int*) getAPtr() {
    return &g_a;
}

EM_PORT_API(double*) getBPtr() {
    return &g_b;
}

EM_PORT_API(void) printGlobal() {

    printf("In Wasm, a = %d, b = %lf\n", g_a, g_b);
}



EM_PORT_API(int*)fibonacci(int count) {


    int* result = (int*)malloc(count*sizeof(int));

    int i0 = 0;
    int i1 = 1;
    result[0] = 1;

    for (int i = 1; i < count; i++) {

        result[i] = i1 + i0;

        i0 = i1;
        i1 = result[i];
    }


    return result;
}

EM_PORT_API(void) freeMem(void* ptr) {

   free(ptr);
}

EM_PORT_API(int) sum(int* ptr, int count) {


    int sum = 0;

    for(int i = 0; i < count; i++) {

        sum += ptr[i];

    }

    return sum;

}

EM_PORT_API(const char*) get_string() {
	static const char str[] = "Hello, wolrd! 你好，世界！";
	return str;
}


EM_PORT_API(void) print_string(char* ptr) {

    printf("%s\n", ptr);
}











