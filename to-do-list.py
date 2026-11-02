user_input = 'random'
data=[]
def show_menu():
    print("MENU: ")
    print("1. Add an item")
    print('2.Mark as done')
    print('3.view items')
    print('4.Exit')
while user_input !='4':
    show_menu()
    user_input=input("Enter your choice: ")
    if user_input=='1':
         item=input("what is to be done? ")
         data.append(item)
         print('Added an item',item)
    elif user_input=='2':
        item: str=input('what is to be marked as done?')
        if item in data:
           data.remove(item)
           print('Removed  item: ',item)
        else:
            print('Item doesnot exist in the list: ')
    elif user_input=='3':
        print('List of to do items: ')
        for item in data:
            print(item)
    elif user_input=='4':
         print('Goodbye!')  
    else:
        print("please enter of 1,2,3 or 4")
