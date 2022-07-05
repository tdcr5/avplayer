#include <emscripten/bind.h>
#include <stdio.h>
#include <array>
using namespace emscripten;





int multipy(int x, int y) {

    return x*y;
}

int add(int x, int y) {

    return x+y;
}


int sub(int x, int y) {

    return x-y;
}


class TestClass {
public:
  TestClass(int x, std::string y)
    : x(x)
    , y(y)
  {}

  void incrementX() {
    ++x;
  }

  int getX() const { return x; }
  void setX(int x_) { x = x_; }

  static std::string getStringFromInstance(const TestClass& instance) {
    return instance.y;
  }

  ~TestClass() {

    printf("TestClass dealloc ~\n");
  }

private:
  int x;
  std::string y;
};


TestClass* MakeTestClass(int x, std::string y) {

    return new TestClass(x, y);

}

struct Point2f {
    float x;
    float y;

    ~Point2f() {

        printf("Point2f dealloc ~\n");
    }
};

struct PersonRecord {
    std::string name;
    int age;

    ~PersonRecord() {

        printf("PersonRecord dealloc ~\n");
    }
};

// Array fields are treated as if they were std::array<type,size>
struct ArrayInStruct {
    int field[2];
};

PersonRecord findPersonAtLocation(Point2f p) {

    PersonRecord one;
    char s[100] = {0};
    sprintf(s, "xiao ming in (%f, %f)", p.x, p.y);
    one.name = s;
    one.age = 10;

    return one;

}

EMSCRIPTEN_BINDINGS(my_value_example) {
    value_array<Point2f>("Point2f")
        .element(&Point2f::x)
        .element(&Point2f::y)
        ;

    value_object<PersonRecord>("PersonRecord")
        .field("name", &PersonRecord::name)
        .field("age", &PersonRecord::age)
        ;

    value_object<ArrayInStruct>("ArrayInStruct")
        .field("field", &ArrayInStruct::field) // Need to register the array type
        ;

    // Register std::array<int, 2> because ArrayInStruct::field is interpreted as such
    // value_array<std::array<int, 2>>("array_int_2")
    //     .element(&std::array<int, 2>::index<0>)
    //     .element(&std::array<int, 2>::index<1>)
    //     ;

    function("findPersonAtLocation", &findPersonAtLocation);
}



EMSCRIPTEN_BINDINGS(my_module) {
    function("multipy", &multipy);
    function("addEx", &add);
    function("sub", &sub);
      class_<TestClass>("TestClass")
    .constructor(&MakeTestClass, allow_raw_pointers())
    .function("incrementX", &TestClass::incrementX)
    .property("x", &TestClass::getX, &TestClass::setX)
    .class_function("getStringFromInstance", &TestClass::getStringFromInstance)
    ;
}
